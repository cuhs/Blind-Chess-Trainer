import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import {
  buildContextualStrings,
  resolveVoiceTranscript,
  type MoveCandidate,
  type VoiceResolveResult,
} from '@mindboard/voice-pipeline';
import { ensureMatchAudioMode } from '@/lib/matchAudio';
import type { VoiceListenMode } from '@/stores/guestStore';

export type MatchSpeechStatus =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'processing';

export type ListeningSource = 'auto' | 'manual' | 'hold' | null;

interface UseMatchSpeechOptions {
  enabled: boolean;
  fen: string;
  listenMode: VoiceListenMode;
  disambiguation?: { candidates: MoveCandidate[] } | null;
  onTranscript: (result: VoiceResolveResult) => void;
}

function transcriptsFromResults(
  results: Array<{ transcript?: string }> | undefined,
): string[] {
  if (!results?.length) return [];
  return results
    .map((result) => result.transcript?.trim())
    .filter((transcript): transcript is string => Boolean(transcript));
}

export function useMatchSpeech({
  enabled,
  fen,
  listenMode,
  disambiguation,
  onTranscript,
}: UseMatchSpeechOptions) {
  const [status, setStatus] = useState<MatchSpeechStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastResolveResult, setLastResolveResult] =
    useState<VoiceResolveResult | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [listeningSource, setListeningSource] = useState<ListeningSource>(null);

  const onTranscriptRef = useRef(onTranscript);
  const requiresOnDeviceRef = useRef(false);
  const fenRef = useRef(fen);
  const disambiguationRef = useRef(disambiguation);
  const submitOnStopRef = useRef(false);
  const pendingResultRef = useRef<VoiceResolveResult | null>(null);
  const listeningSourceRef = useRef<ListeningSource>(null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  useEffect(() => {
    disambiguationRef.current = disambiguation;
  }, [disambiguation]);

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

  const submitPendingResult = useCallback(() => {
    const result = pendingResultRef.current;
    pendingResultRef.current = null;
    if (!result) return;
    setLastResolveResult(result);
    onTranscriptRef.current(result);
  }, []);

  const stopListening = useCallback(
    ({ submit = false }: { submit?: boolean } = {}) => {
      submitOnStopRef.current = submit;
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        if (submit && pendingResultRef.current) {
          submitPendingResult();
        }
        setStatus('idle');
        setListeningSource(null);
        setInterimTranscript('');
      }
      setStatus((current) => (current === 'listening' ? 'processing' : current));
    },
    [submitPendingResult],
  );

  useSpeechRecognitionEvent('start', () => {
    setStatus('listening');
    setSpeechError(null);
    setInterimTranscript('');
    pendingResultRef.current = null;
  });

  useSpeechRecognitionEvent('end', () => {
    if (submitOnStopRef.current) {
      submitPendingResult();
    }
    submitOnStopRef.current = false;
    setStatus('idle');
    setListeningSource(null);
    listeningSourceRef.current = null;
    setInterimTranscript('');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const alternatives = transcriptsFromResults(event.results);
    if (!alternatives.length) return;

    const resolved = resolveVoiceTranscript(
      alternatives,
      fenRef.current,
      disambiguationRef.current,
    );

    if (event.isFinal) {
      pendingResultRef.current = resolved;
      setInterimTranscript('');
      if (
        !submitOnStopRef.current &&
        listeningSourceRef.current !== 'hold'
      ) {
        submitPendingResult();
      }
      return;
    }

    setInterimTranscript(resolved.displayText);
    pendingResultRef.current = resolved;
  });

  useSpeechRecognitionEvent('error', (event) => {
    setStatus('idle');
    setListeningSource(null);
    listeningSourceRef.current = null;
    setInterimTranscript('');
    submitOnStopRef.current = false;
    pendingResultRef.current = null;

    if (event.error === 'aborted') {
      return;
    }

    if (event.error === 'no-speech') {
      setSpeechError('No speech detected — try again.');
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
    setListeningSource(null);
    listeningSourceRef.current = null;
  }, [enabled, stopListening]);

  const startListening = useCallback(
    async (source: ListeningSource) => {
      if (!enabled || !source) return;

      setSpeechError(null);
      setPermissionDenied(false);
      setStatus('requesting_permission');
      setListeningSource(source);
      listeningSourceRef.current = source;

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setPermissionDenied(true);
        setSpeechError('Microphone and speech recognition are required for voice moves.');
        setStatus('idle');
        setListeningSource(null);
        listeningSourceRef.current = null;
        return;
      }

      await ensureMatchAudioMode();

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setSpeechError('Speech recognition is not available on this device.');
        setStatus('idle');
        setListeningSource(null);
        listeningSourceRef.current = null;
        return;
      }

      setInterimTranscript('');
      pendingResultRef.current = null;
      submitOnStopRef.current = false;

      try {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          continuous: false,
          maxAlternatives: 5,
          requiresOnDeviceRecognition: requiresOnDeviceRef.current,
          contextualStrings: buildContextualStrings(
            fenRef.current,
            disambiguationRef.current,
          ),
          iosTaskHint: 'confirmation',
          iosCategory: {
            category: 'playAndRecord',
            categoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
            mode: 'measurement',
          },
        });
      } catch (error) {
        setStatus('idle');
        setListeningSource(null);
        listeningSourceRef.current = null;
        setSpeechError(
          error instanceof Error ? error.message : 'Voice input failed to start.',
        );
      }
    },
    [enabled],
  );

  const toggleListening = useCallback(async () => {
    if (status === 'listening') {
      stopListening({ submit: false });
      return;
    }

    if (status === 'requesting_permission' || status === 'processing') {
      return;
    }

    await startListening('manual');
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
    listeningSource,
    listenMode,
    interimTranscript,
    lastResolveResult,
    speechError,
    permissionDenied,
    startListening,
    stopListening,
    toggleListening,
    clearSpeechError,
  };
}
