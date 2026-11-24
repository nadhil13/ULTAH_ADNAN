import { useCallback, useEffect, useRef, useState } from 'react';

interface AmbientAudioState {
  isPlaying: boolean;
  volume: number;
  customTrackName: string | null;
  toggle: () => void;
  startIfPaused: () => void;
  setVolume: (nextVolume: number) => void;
  loadCustomAudio: (file: File) => void;
  clearCustomAudio: () => void;
}

// Warm major-seventh and sixth ambient chord cycle in Hz (Cmaj7, Am7, Fmaj7, G6).
const CHORD_SEQUENCE: number[][] = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 329.63, 392.0],
];

const MELODY_BELLS: number[] = [
  523.25, 659.25, 587.33, 493.88, 440.0, 523.25, 392.0, 493.88,
];

export function useAmbientAudio(): AmbientAudioState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.42);
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const customUrlRef = useRef<string | null>(null);

  const stopSynthLoop = useCallback(() => {
    if (schedulerRef.current !== null) {
      window.clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  }, []);

  const triggerChordStep = useCallback((ctx: AudioContext, master: GainNode) => {
    const now = ctx.currentTime;
    const chordIndex = stepRef.current % CHORD_SEQUENCE.length;
    const bellIndex = stepRef.current % MELODY_BELLS.length;
    const chord = CHORD_SEQUENCE[chordIndex];
    const bellFreq = MELODY_BELLS[bellIndex];

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, now);
    filter.connect(master);

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const startOffset = now + idx * 0.14;
      noteGain.gain.setValueAtTime(0.0001, startOffset);
      noteGain.gain.exponentialRampToValueAtTime(0.065, startOffset + 0.65);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startOffset + 3.8);

      osc.connect(noteGain);
      noteGain.connect(filter);
      osc.start(startOffset);
      osc.stop(startOffset + 3.95);
    });

    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(bellFreq, now + 1.5);
    bellGain.gain.setValueAtTime(0.0001, now + 1.5);
    bellGain.gain.exponentialRampToValueAtTime(0.045, now + 1.56);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
    bellOsc.connect(bellGain);
    bellGain.connect(filter);
    bellOsc.start(now + 1.5);
    bellOsc.stop(now + 3.5);

    stepRef.current += 1;
  }, []);

  const startSynthLoop = useCallback(async () => {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    if (!audioCtxRef.current) {
      const ctx = new AudioContextCtor();
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, ctx.currentTime);
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) {
      return;
    }

    // Resume AudioContext inside user gesture to satisfy browser autoplay policies.
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.08);

    triggerChordStep(ctx, master);
    if (schedulerRef.current !== null) {
      window.clearInterval(schedulerRef.current);
    }
    schedulerRef.current = window.setInterval(() => {
      if (audioCtxRef.current && masterGainRef.current && audioCtxRef.current.state === 'running') {
        triggerChordStep(audioCtxRef.current, masterGainRef.current);
      }
    }, 3600);
  }, [triggerChordStep, volume]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      stopSynthLoop();
      setIsPlaying(false);
      return;
    }

    if (customAudioRef.current) {
      customAudioRef.current.volume = volume;
      customAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    startSynthLoop()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [isPlaying, startSynthLoop, stopSynthLoop, volume]);

  const startIfPaused = useCallback(() => {
    if (isPlaying) {
      return;
    }
    if (customAudioRef.current) {
      customAudioRef.current.volume = volume;
      customAudioRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }
    startSynthLoop()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [isPlaying, startSynthLoop, volume]);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0, Math.min(1, nextVolume));
    setVolumeState(clamped);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.05);
    }
    if (customAudioRef.current) {
      customAudioRef.current.volume = clamped;
    }
  }, []);

  const clearCustomAudio = useCallback(() => {
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current.src = '';
      customAudioRef.current = null;
    }
    if (customUrlRef.current) {
      URL.revokeObjectURL(customUrlRef.current);
      customUrlRef.current = null;
    }
    setCustomTrackName(null);
    setIsPlaying(false);
  }, []);

  const loadCustomAudio = useCallback(
    (file: File) => {
      stopSynthLoop();
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      if (customUrlRef.current) {
        URL.revokeObjectURL(customUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      customUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      audio.loop = true;
      audio.volume = volume;
      customAudioRef.current = audio;
      setCustomTrackName(file.name);
      setIsPlaying(false);
    },
    [stopSynthLoop, volume]
  );

  useEffect(() => {
    return () => {
      stopSynthLoop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      if (customUrlRef.current) {
        URL.revokeObjectURL(customUrlRef.current);
      }
    };
  }, [stopSynthLoop]);

  return {
    isPlaying,
    volume,
    customTrackName,
    toggle,
    startIfPaused,
    setVolume,
    loadCustomAudio,
    clearCustomAudio,
  };
}
