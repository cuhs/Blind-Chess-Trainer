import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import {
  CHESS_MOVE_CONTEXTUAL_STRINGS,
  prepareMoveTranscript,
} from '@mindboard/voice-pipeline';
import { ensureMatchAudioMode } from '@/lib/matchAudio';

export type MatchSpeechStatus =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'processing';

interface UseMatchSpeechOptions {
  enabled: boolean;
  onTranscript: (transcript: string) => void;
}

function transcriptFromResults(
  results: Array<{ transcript?: string }> | undefined,
): string {
  if (!results?.length) return '';
  return results[0]?.transcript?.trim() ?? '';
}

export function useMatchSpeech({ enabled, onTranscript }: UseMatchSpeechOptions) {
  const [status, setStatus] = useState<MatchSpeechStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  const requiresOnDeviceRef = useRef(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const onDevice =
          await ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
        if (!cancelled) {
          requiresOnDeviceRef.current = onDevice;
        }
      } catch {
        if (!cancelled) {
          requiresOnDeviceRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Already stopped.
    }
    setStatus((current) => (current === 'listening' ? 'processing' : current));
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setStatus('listening');
    setSpeechError(null);
    setInterimTranscript('');
  });

  useSpeechRecognitionEvent('end', () => {
    setStatus('idle');
    setInterimTranscript('');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const raw = transcriptFromResults(event.results);
    if (!raw) return;

    const prepared = prepareMoveTranscript(raw);
    if (event.isFinal) {
      setLastTranscript(prepared);
      setInterimTranscript('');
      setStatus('idle');
      onTranscriptRef.current(prepared);
      return;
    }

    setInterimTranscript(prepared);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setStatus('idle');
    setInterimTranscript('');

    if (event.error === 'aborted' || event.error === 'no-speech') {
      return;
    }

    if (event.error === 'not-allowed') {
      setPermissionDenied(true);
      setSpeechError('Microphone and speech recognition are required for voice moves.');
      return;
    }

    setSpeechError(event.message || 'Voice input failed. Try again.');
  });

  useEffect(() => {
    if (enabled) return;
    stopListening();
    setInterimTranscript('');
    setStatus('idle');
  }, [enabled, stopListening]);

  const startListening = useCallback(async () => {
    if (!enabled) return;

    setSpeechError(null);
    setPermissionDenied(false);
    setStatus('requesting_permission');

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      setSpeechError('Microphone and speech recognition are required for voice moves.');
      setStatus('idle');
      return;
    }

    await ensureMatchAudioMode();

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setSpeechError('Speech recognition is not available on this device.');
      setStatus('idle');
      return;
    }

    setInterimTranscript('');

    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        requiresOnDeviceRecognition: requiresOnDeviceRef.current,
        contextualStrings: [...CHESS_MOVE_CONTEXTUAL_STRINGS],
        iosTaskHint: 'confirmation',
        iosCategory: {
          category: 'playAndRecord',
          categoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
          mode: 'measurement',
        },
      });
    } catch (error) {
      setStatus('idle');
      setSpeechError(
        error instanceof Error ? error.message : 'Voice input failed to start.',
      );
    }
  }, [enabled]);

  const toggleListening = useCallback(async () => {
    if (status === 'listening') {
      stopListening();
      return;
    }

    if (status === 'requesting_permission' || status === 'processing') {
      return;
    }

    await startListening();
  }, [startListening, status, stopListening]);

  const clearSpeechError = useCallback(() => {
    setSpeechError(null);
  }, []);

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // Not listening.
      }
    };
  }, []);

  return {
    status,
    isListening: status === 'listening',
    interimTranscript,
    lastTranscript,
    speechError,
    permissionDenied,
    toggleListening,
    stopListening,
    clearSpeechError,
  };
}
