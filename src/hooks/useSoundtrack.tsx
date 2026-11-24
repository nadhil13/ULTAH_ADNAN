import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_YOUTUBE_TRACK_TITLE,
  DEFAULT_YOUTUBE_VIDEO_ID,
} from '../data/birthdayConfig';

export type SoundtrackSourceMode = 'youtube' | 'ambient' | 'local';
export type SoundtrackPlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'blocked';

export interface SoundtrackContextValue {
  sourceMode: SoundtrackSourceMode;
  playbackStatus: SoundtrackPlaybackStatus;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  youtubeVideoId: string;
  customTrackName: string | null;
  trackLabel: string;
  statusLabel: string;
  toggle: () => void;
  playFromGesture: () => void;
  setVolume: (nextVolume: number) => void;
  toggleMute: () => void;
  switchToAmbient: () => void;
  switchToYouTube: () => void;
  loadCustomAudio: (file: File) => void;
  clearCustomAudio: () => void;
  setDucking: (ducked: boolean) => void;
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (options: { videoId: string; suggestedQuality?: string }) => void;
  destroy: () => void;
}

interface YTPlayerEvent {
  target: YTPlayerInstance;
  data: number;
}

interface YTGlobal {
  Player: new (
    element: HTMLElement,
    options: {
      width?: string | number;
      height?: string | number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState?: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YTGlobal> | null = null;

function ensureYouTubeIframeApi(): Promise<YTGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window unavailable'));
  }
  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise<YTGlobal>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      ytApiPromise = null;
      reject(new Error('YouTube IFrame API load timeout'));
    }, 10000);

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === 'function') {
        prevCallback();
      }
      window.clearTimeout(timeoutId);
      if (window.YT && typeof window.YT.Player === 'function') {
        resolve(window.YT);
      } else {
        ytApiPromise = null;
        reject(new Error('YouTube IFrame API unavailable'));
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeoutId);
        ytApiPromise = null;
        reject(new Error('Failed to load YouTube IFrame API script'));
      };
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

// Warm major-seventh ambient synth fallback when YouTube embeds are blocked by network policies.
const CHORD_SEQUENCE: number[][] = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 329.63, 392.0],
];

const MELODY_BELLS: number[] = [
  523.25, 659.25, 587.33, 493.88, 440.0, 523.25, 392.0, 493.88,
];

const SoundtrackContext = createContext<SoundtrackContextValue | null>(null);

interface SoundtrackProviderProps {
  youtubeVideoId: string;
  children: ReactNode;
}

export function SoundtrackProvider({
  youtubeVideoId,
  children,
}: SoundtrackProviderProps) {
  const resolvedVideoId = youtubeVideoId.trim() || DEFAULT_YOUTUBE_VIDEO_ID;

  const [sourceMode, setSourceMode] = useState<SoundtrackSourceMode>('youtube');
  const [playbackStatus, setPlaybackStatus] =
    useState<SoundtrackPlaybackStatus>('idle');
  const [volume, setVolumeState] = useState<number>(0.68);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [customTrackName, setCustomTrackName] = useState<string | null>(null);
  const [isDucked, setIsDucked] = useState<boolean>(false);

  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytReadyRef = useRef<boolean>(false);
  const activeVideoIdRef = useRef<string>(resolvedVideoId);
  const pendingPlayRef = useRef<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const customUrlRef = useRef<string | null>(null);

  const effectiveVolume = isMuted ? 0 : isDucked ? Math.min(volume, 0.08) : volume;
  const effectiveVolumeRef = useRef<number>(effectiveVolume);
  effectiveVolumeRef.current = effectiveVolume;

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
    const chord = CHORD_SEQUENCE[stepRef.current % CHORD_SEQUENCE.length];
    const bellFreq = MELODY_BELLS[stepRef.current % MELODY_BELLS.length];

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
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    if (!audioCtxRef.current) {
      const ctx = new AudioContextCtor();
      const master = ctx.createGain();
      master.gain.setValueAtTime(effectiveVolumeRef.current, ctx.currentTime);
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) {
      return;
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    master.gain.setTargetAtTime(effectiveVolumeRef.current, ctx.currentTime, 0.08);
    triggerChordStep(ctx, master);

    if (schedulerRef.current !== null) {
      window.clearInterval(schedulerRef.current);
    }
    schedulerRef.current = window.setInterval(() => {
      if (
        audioCtxRef.current &&
        masterGainRef.current &&
        audioCtxRef.current.state === 'running'
      ) {
        triggerChordStep(audioCtxRef.current, masterGainRef.current);
      }
    }, 3600);
  }, [triggerChordStep]);

  const pauseYouTubeSafe = useCallback(() => {
    pendingPlayRef.current = false;
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // Ignore transient iframe bridge errors.
      }
    }
  }, []);

  // Mount YouTube IFrame Player safely across React 19 StrictMode double-mounts.
  useEffect(() => {
    const host = ytHostRef.current;
    if (!host) {
      return;
    }

    let cancelled = false;
    const mountSlot = document.createElement('div');
    host.innerHTML = '';
    host.appendChild(mountSlot);

    ensureYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !host.isConnected) {
          return;
        }

        const initialId = activeVideoIdRef.current;
        const player = new YT.Player(mountSlot, {
          width: '1',
          height: '1',
          videoId: initialId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: initialId,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) {
                return;
              }
              ytPlayerRef.current = event.target;
              ytReadyRef.current = true;
              try {
                const volPct = Math.round(effectiveVolumeRef.current * 100);
                event.target.setVolume(volPct);
                if (volPct === 0) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                }
                if (pendingPlayRef.current) {
                  pendingPlayRef.current = false;
                  event.target.playVideo();
                }
              } catch {
                // Ignore initial volume sync errors.
              }
            },
            onStateChange: (event) => {
              if (cancelled) {
                return;
              }
              // YT.PlayerState: ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
              if (event.data === 1) {
                setPlaybackStatus('playing');
              } else if (event.data === 3) {
                setPlaybackStatus('loading');
              } else if (event.data === 2) {
                setPlaybackStatus((prev) => (prev === 'blocked' ? prev : 'paused'));
              } else if (event.data === 0) {
                try {
                  event.target.playVideo();
                } catch {
                  setPlaybackStatus('paused');
                }
              }
            },
            onError: () => {
              if (cancelled) {
                return;
              }
              pendingPlayRef.current = false;
              setPlaybackStatus('blocked');
            },
          },
        });

        ytPlayerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) {
          pendingPlayRef.current = false;
          setPlaybackStatus('blocked');
        }
      });

    return () => {
      cancelled = true;
      ytReadyRef.current = false;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore teardown errors on unmounted iframe.
        }
        ytPlayerRef.current = null;
      }
      host.innerHTML = '';
    };
  }, []);

  // Respond when the user updates youtubeVideoId in Ubah Data.
  useEffect(() => {
    if (activeVideoIdRef.current === resolvedVideoId) {
      return;
    }
    activeVideoIdRef.current = resolvedVideoId;

    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        if (sourceMode === 'youtube' && playbackStatus === 'playing') {
          ytPlayerRef.current.loadVideoById(resolvedVideoId);
        } else {
          ytPlayerRef.current.cueVideoById({ videoId: resolvedVideoId });
          if (sourceMode === 'youtube' && playbackStatus === 'blocked') {
            setPlaybackStatus('idle');
          }
        }
      } catch {
        // Ignore transient cue errors.
      }
    }
  }, [playbackStatus, resolvedVideoId, sourceMode]);

  // Keep active audio output volume synchronized with volume, mute, and video-lightbox ducking.
  useEffect(() => {
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        const volPct = Math.round(effectiveVolume * 100);
        ytPlayerRef.current.setVolume(volPct);
        if (isMuted || volPct === 0) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } catch {
        // Ignore transient bridge errors.
      }
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        effectiveVolume,
        audioCtxRef.current.currentTime,
        0.06
      );
    }
    if (customAudioRef.current) {
      customAudioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume, isMuted]);

  const playYouTubeDirect = useCallback(() => {
    stopSynthLoop();
    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }

    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        const volPct = Math.round(effectiveVolumeRef.current * 100);
        if (!isMuted && volPct > 0) {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volPct);
        }
        setPlaybackStatus('loading');
        ytPlayerRef.current.playVideo();
        return;
      } catch {
        setPlaybackStatus('blocked');
        return;
      }
    }

    pendingPlayRef.current = true;
    setPlaybackStatus('loading');
  }, [isMuted, stopSynthLoop]);

  const playFromGesture = useCallback(() => {
    if (playbackStatus === 'playing' || playbackStatus === 'loading') {
      return;
    }

    if (sourceMode === 'local' && customAudioRef.current) {
      customAudioRef.current.volume = effectiveVolumeRef.current;
      customAudioRef.current
        .play()
        .then(() => setPlaybackStatus('playing'))
        .catch(() => setPlaybackStatus('paused'));
      return;
    }

    if (sourceMode === 'ambient' || playbackStatus === 'blocked') {
      setSourceMode('ambient');
      startSynthLoop()
        .then(() => setPlaybackStatus('playing'))
        .catch(() => setPlaybackStatus('paused'));
      return;
    }

    playYouTubeDirect();
  }, [playYouTubeDirect, playbackStatus, sourceMode, startSynthLoop]);

  const toggle = useCallback(() => {
    if (playbackStatus === 'playing' || playbackStatus === 'loading') {
      pauseYouTubeSafe();
      stopSynthLoop();
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      setPlaybackStatus('paused');
      return;
    }

    if (sourceMode === 'local' && customAudioRef.current) {
      customAudioRef.current.volume = effectiveVolumeRef.current;
      customAudioRef.current
        .play()
        .then(() => setPlaybackStatus('playing'))
        .catch(() => setPlaybackStatus('paused'));
      return;
    }

    if (sourceMode === 'ambient') {
      startSynthLoop()
        .then(() => setPlaybackStatus('playing'))
        .catch(() => setPlaybackStatus('paused'));
      return;
    }

    if (playbackStatus === 'blocked') {
      setSourceMode('ambient');
      startSynthLoop()
        .then(() => setPlaybackStatus('playing'))
        .catch(() => setPlaybackStatus('paused'));
      return;
    }

    playYouTubeDirect();
  }, [
    pauseYouTubeSafe,
    playYouTubeDirect,
    playbackStatus,
    sourceMode,
    startSynthLoop,
    stopSynthLoop,
  ]);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0, Math.min(1, nextVolume));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const switchToAmbient = useCallback(() => {
    pauseYouTubeSafe();
    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }
    setSourceMode('ambient');
    startSynthLoop()
      .then(() => setPlaybackStatus('playing'))
      .catch(() => setPlaybackStatus('paused'));
  }, [pauseYouTubeSafe, startSynthLoop]);

  const switchToYouTube = useCallback(() => {
    stopSynthLoop();
    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }
    setSourceMode('youtube');
    playYouTubeDirect();
  }, [playYouTubeDirect, stopSynthLoop]);

  const loadCustomAudio = useCallback(
    (file: File) => {
      pauseYouTubeSafe();
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
      audio.volume = effectiveVolumeRef.current;
      customAudioRef.current = audio;
      setCustomTrackName(file.name);
      setSourceMode('local');
      setPlaybackStatus('paused');
    },
    [pauseYouTubeSafe, stopSynthLoop]
  );

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
    setSourceMode('youtube');
    setPlaybackStatus('idle');
  }, []);

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

  const isPlaying = playbackStatus === 'playing';

  const trackLabel =
    sourceMode === 'local' && customTrackName
      ? customTrackName
      : sourceMode === 'ambient'
        ? 'Melodi Ambient Bawaan'
        : resolvedVideoId === DEFAULT_YOUTUBE_VIDEO_ID
          ? DEFAULT_YOUTUBE_TRACK_TITLE
          : `Lagu YouTube (${resolvedVideoId})`;

  const statusLabel =
    playbackStatus === 'loading'
      ? 'Memuat lagu...'
      : playbackStatus === 'playing'
        ? 'Diputar'
        : playbackStatus === 'paused'
          ? 'Jeda'
          : playbackStatus === 'blocked'
            ? 'Embed diblokir jaringan'
            : 'Putar lagu';

  return (
    <SoundtrackContext.Provider
      value={{
        sourceMode,
        playbackStatus,
        isPlaying,
        volume,
        isMuted,
        youtubeVideoId: resolvedVideoId,
        customTrackName,
        trackLabel,
        statusLabel,
        toggle,
        playFromGesture,
        setVolume,
        toggleMute,
        switchToAmbient,
        switchToYouTube,
        loadCustomAudio,
        clearCustomAudio,
        setDucking: setIsDucked,
      }}
    >
      {children}
      {/* Never use display:none or visibility:hidden so browsers permit YouTube audio playback. */}
      <div
        ref={ytHostRef}
        aria-hidden="true"
        data-testid="youtube-audio-host"
        style={{
          width: '1px',
          height: '1px',
          position: 'fixed',
          bottom: 0,
          left: 0,
          opacity: 0.01,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      />
    </SoundtrackContext.Provider>
  );
}

export function useSoundtrack(): SoundtrackContextValue {
  const ctx = useContext(SoundtrackContext);
  if (!ctx) {
    throw new Error('useSoundtrack must be used inside SoundtrackProvider');
  }
  return ctx;
}
