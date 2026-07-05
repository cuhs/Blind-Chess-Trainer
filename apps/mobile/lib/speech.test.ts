import { beforeEach, describe, expect, it, vi } from 'vitest';

const speakMock = vi.fn();
const stopMock = vi.fn().mockResolvedValue(undefined);

vi.mock('expo-speech', () => ({
  speak: speakMock,
  stop: stopMock,
}));

vi.mock('expo-audio', () => ({
  setAudioModeAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

describe('speakNarration', () => {
  beforeEach(() => {
    speakMock.mockReset();
    stopMock.mockReset();
    stopMock.mockResolvedValue(undefined);
  });

  it('does not call onDone after cancel', async () => {
    const { speakNarration } = await import('./speech');
    const onDone = vi.fn();
    const cancel = speakNarration('White plays e4', { onDone });

    cancel();
    await Promise.resolve();
    await Promise.resolve();

    expect(onDone).not.toHaveBeenCalled();
    expect(stopMock).toHaveBeenCalled();
  });

  it('does not call onDone when speech is stopped mid-utterance', async () => {
    speakMock.mockImplementation((_text, options) => {
      options?.onStopped?.();
    });

    const { speakNarration } = await import('./speech');
    const onDone = vi.fn();

    speakNarration('White develops the kingside knight.', { onDone });
    await Promise.resolve();
    await Promise.resolve();

    expect(onDone).not.toHaveBeenCalled();
  });
});
