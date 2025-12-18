
let audioContext: AudioContext | null = null;

export const playMoveSound = () => {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }

    // Resume audio context if it was suspended (browser autoplay policy)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // A pleasant "pop" / "thock" sound
    // Frequency sweep from 400Hz down to 50Hz to mimic a physical tile sound
   // oscillator.type = 'sine';
    oscillator.type = 'square';
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);

    // Volume envelope: fast attack, exponential decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};
