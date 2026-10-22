// Audio Utility for Endlessync UI clicks & sound effects

let clickAudioPool: HTMLAudioElement[] = [];
const POOL_SIZE = 5;

if (typeof window !== 'undefined') {
  for (let i = 0; i < POOL_SIZE; i++) {
    const audio = new Audio('/media/click.mp3');
    audio.preload = 'auto';
    audio.volume = 0.45;
    clickAudioPool.push(audio);
  }
}

let poolIndex = 0;

export function playClickSound() {
  if (typeof window === 'undefined') return;
  try {
    if (clickAudioPool.length === 0) {
      const audio = new Audio('/media/click.mp3');
      audio.volume = 0.45;
      audio.play().catch(() => {});
      return;
    }
    const audio = clickAudioPool[poolIndex];
    poolIndex = (poolIndex + 1) % clickAudioPool.length;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Ignore autoplay restriction or interaction errors
  }
}
