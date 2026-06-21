import { Platform } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';

let matchAudioReady = false;

/** Playback + mic for voice match STT (separate from narration-only mode). */
export async function ensureMatchAudioMode(): Promise<void> {
  if (matchAudioReady) return;

  if (Platform.OS === 'ios') {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
  }

  matchAudioReady = true;
}
