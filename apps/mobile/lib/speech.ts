import { Platform } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';

let audioModeReady = false;

/** iOS silent switch blocks TTS unless the audio session allows playback. */
export async function ensureSpeechAudioMode(): Promise<void> {
  if (audioModeReady) return;

  if (Platform.OS === 'ios') {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });
  }

  audioModeReady = true;
}

export interface SpeakNarrationCallbacks {
  onDone: () => void;
  onError?: (error: unknown) => void;
}

/** Starts TTS; returns cancel() so callers can abort before speak begins. */
export function speakNarration(
  text: string,
  { onDone, onError }: SpeakNarrationCallbacks,
): () => void {
  let cancelled = false;

  const finish = () => {
    if (cancelled) return;
    onDone();
  };

  void (async () => {
    if (!text.trim()) {
      finish();
      return;
    }

    await ensureSpeechAudioMode();
    if (cancelled) return;

    await Speech.stop();
    if (cancelled) return;

    Speech.speak(text, {
      language: 'en-US',
      rate: 0.92,
      pitch: 1.0,
      onDone: finish,
      onStopped: finish,
      onError: (error) => {
        if (__DEV__) {
          console.warn('[speech] narration failed', error);
        }
        onError?.(error);
        finish();
      },
    });
  })();

  return () => {
    cancelled = true;
    void Speech.stop();
  };
}

export async function stopNarration(): Promise<void> {
  await Speech.stop();
}
