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

export async function speakNarration(
  text: string,
  { onDone, onError }: SpeakNarrationCallbacks,
): Promise<void> {
  if (!text.trim()) {
    onDone();
    return;
  }

  await ensureSpeechAudioMode();
  await Speech.stop();

  Speech.speak(text, {
    language: 'en-US',
    rate: 0.92,
    pitch: 1.0,
    onDone,
    onStopped: onDone,
    onError: (error) => {
      if (__DEV__) {
        console.warn('[speech] narration failed', error);
      }
      onError?.(error);
      onDone();
    },
  });
}

export async function stopNarration(): Promise<void> {
  await Speech.stop();
}
