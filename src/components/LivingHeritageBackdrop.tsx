import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

interface LivingHeritageBackdropProps {
  isDark: boolean;
}

type StageIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface AtmosphericParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  phase: number;
  phaseSpeed: number;
  kind: 'petal' | 'mote' | 'lantern';
  colorIdx: number;
  alpha: number;
}

interface BirdSilhouette {
  x: number;
  y: number;
  speed: number;
  scale: number;
  wingPhase: number;
  wingSpeed: number;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function LivingHeritageBackdrop({ isDark }: LivingHeritageBackdropProps) {
  const { getScrollMetrics } = useSmoothScroll();

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Per-section mood washes (1 = base #beranda, 2..7 crossfaded bidirectionally via ScrollTrigger scrub: 0.7)
  const moodDedikasiRef = useRef<HTMLDivElement | null>(null);
  const moodBabakRef = useRef<HTMLDivElement | null>(null);
  const moodArsipRef = useRef<HTMLDivElement | null>(null);
  const moodSuratRef = useRef<HTMLDivElement | null>(null);
  const moodLilinRef = useRef<HTMLDivElement | null>(null);
  const moodUcapanRef = useRef<HTMLDivElement | null>(null);

  // Per-section scenic artwork layers
  const sunbeamsAndSongketRef = useRef<HTMLDivElement | null>(null);
  const chapterSprigsRef = useRef<HTMLDivElement | null>(null);
  const archiveSunsetHaloRef = useRef<HTMLDivElement | null>(null);
  const letterPressedFloralRef = useRef<HTMLDivElement | null>(null);
  const twilightStarsRef = useRef<SVGGElement | null>(null);
  const twilightValleyGlazeRef = useRef<HTMLDivElement | null>(null);

  // Persistent multi-plane gouache world layers
  const mountainsRef = useRef<HTMLDivElement | null>(null);
  const mistBackRef = useRef<SVGPathElement | null>(null);
  const mistFrontRef = useRef<SVGPathElement | null>(null);
  const valleyRef = useRef<HTMLDivElement | null>(null);
  const lanternsRef = useRef<SVGGElement | null>(null);
  const riverShimmerRef = useRef<SVGPathElement | null>(null);
  const leftBranchRef = useRef<HTMLDivElement | null>(null);
  const rightBranchRef = useRef<HTMLDivElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStageRef = useRef<StageIndex>(1);

  // Bidirectional GSAP ScrollTrigger (scrub: 0.7) across all 7 sections (alive scrolling down AND up).
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Global continuous parallax for Bukit Barisan, drifting mist bands, Rumah Gadang valley, and shimmering river.
      const docTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      if (mountainsRef.current) {
        docTl.fromTo(
          mountainsRef.current,
          { yPercent: 0, scale: 1 },
          { yPercent: -12, scale: 1.06, ease: 'none', duration: 1 },
          0
        );
      }

      if (mistBackRef.current) {
        docTl.fromTo(
          mistBackRef.current,
          { xPercent: -4 },
          { xPercent: 5, ease: 'none', duration: 1 },
          0
        );
      }

      if (mistFrontRef.current) {
        docTl.fromTo(
          mistFrontRef.current,
          { xPercent: 4 },
          { xPercent: -5, ease: 'none', duration: 1 },
          0
        );
      }

      if (valleyRef.current) {
        docTl.fromTo(
          valleyRef.current,
          { yPercent: 0, scale: 1 },
          { yPercent: -16, scale: 1.07, ease: 'none', duration: 1 },
          0
        );
      }

      if (riverShimmerRef.current) {
        docTl.fromTo(
          riverShimmerRef.current,
          { strokeDashoffset: 180, opacity: 0.55 },
          { strokeDashoffset: 0, opacity: 0.92, ease: 'none', duration: 1 },
          0
        );
      }

      // Opening botanical canopies part outward on scroll down and glide back inward on scroll up.
      const canopyTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 1.25)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      if (leftBranchRef.current) {
        canopyTl.fromTo(
          leftBranchRef.current,
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1 },
          {
            xPercent: -56,
            yPercent: -8,
            rotate: -6,
            opacity: 0.24,
            ease: 'none',
            duration: 1,
          },
          0
        );
      }

      if (rightBranchRef.current) {
        canopyTl.fromTo(
          rightBranchRef.current,
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1 },
          {
            xPercent: 56,
            yPercent: -8,
            rotate: 6,
            opacity: 0.24,
            ease: 'none',
            duration: 1,
          },
          0
        );
      }

      // Vertical counter-drift for #babak side sprigs while scrolling through the 4 chapters.
      const babakEl = document.querySelector<HTMLElement>('#babak');
      if (babakEl && chapterSprigsRef.current) {
        gsap.fromTo(
          chapterSprigsRef.current,
          { yPercent: 8 },
          {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: babakEl,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, [isDark]);

  // Live viewport-aware section mood & scenic layer synchronization (immune to pin-spacers and dynamic height changes).
  useEffect(() => {
    const sectionIds: { id: string; stage: StageIndex }[] = [
      { id: 'beranda', stage: 1 },
      { id: 'dedikasi', stage: 2 },
      { id: 'babak', stage: 3 },
      { id: 'arsip', stage: 4 },
      { id: 'surat', stage: 5 },
      { id: 'lilin', stage: 6 },
      { id: 'ucapan', stage: 7 },
    ];

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const smoothFactor = prefersReducedMotion ? 1 : 0.12;

    const weights: Record<StageIndex, number> = {
      1: 1,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    };

    const setElOpacity = (el: HTMLElement | SVGElement | null, value: number) => {
      if (el) {
        el.style.opacity = value.toFixed(3);
      }
    };

    let rafId = 0;

    const syncMoods = () => {
      const vh = Math.max(1, window.innerHeight);
      const focusY = vh * 0.48;
      let activeStage: StageIndex = 1;

      for (const item of sectionIds) {
        const el = document.getElementById(item.id);
        if (!el) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.top <= focusY) {
          activeStage = item.stage;
        }
      }

      activeStageRef.current = activeStage;

      for (const s of [1, 2, 3, 4, 5, 6, 7] as StageIndex[]) {
        const target = s === activeStage ? 1 : 0;
        weights[s] += (target - weights[s]) * smoothFactor;
        if (Math.abs(target - weights[s]) < 0.002) {
          weights[s] = target;
        }
      }

      setElOpacity(moodDedikasiRef.current, weights[2]);
      setElOpacity(sunbeamsAndSongketRef.current, weights[2]);

      setElOpacity(moodBabakRef.current, weights[3]);
      setElOpacity(chapterSprigsRef.current, weights[3]);

      setElOpacity(moodArsipRef.current, weights[4]);
      setElOpacity(archiveSunsetHaloRef.current, weights[4]);

      setElOpacity(moodSuratRef.current, weights[5]);
      setElOpacity(letterPressedFloralRef.current, weights[5]);

      setElOpacity(moodLilinRef.current, weights[6]);
      setElOpacity(twilightValleyGlazeRef.current, isDark ? 0 : weights[6] * 0.82);
      const baseStarOpacity = isDark ? 0.68 : 0;
      setElOpacity(
        twilightStarsRef.current,
        Math.max(baseStarOpacity, weights[6] * 0.92)
      );

      const baseLanternOpacity = isDark ? 0.68 : 0.24;
      setElOpacity(
        lanternsRef.current,
        Math.max(baseLanternOpacity, weights[6] * 0.98, weights[7] * 0.55)
      );

      setElOpacity(moodUcapanRef.current, weights[7]);

      rafId = window.requestAnimationFrame(syncMoods);
    };

    rafId = window.requestAnimationFrame(syncMoods);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isDark]);

  // Velocity-reactive atmospheric canvas: morning birds, sunlit petals, wax-seal gold dust, & rising lantern motes.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const isMobile = width < 768;
    const particleCount = isMobile ? 14 : 26;

    const particles: AtmosphericParticle[] = Array.from(
      { length: particleCount },
      (_, idx) => {
        const kind: AtmosphericParticle['kind'] =
          idx % 4 === 0 ? 'lantern' : idx % 3 === 0 ? 'mote' : 'petal';
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.4) * 0.36,
          vy:
            kind === 'lantern'
              ? -0.24 - Math.random() * 0.22
              : kind === 'mote'
                ? -0.12 - Math.random() * 0.14
                : 0.2 + Math.random() * 0.28,
          size:
            kind === 'lantern'
              ? 2.4 + Math.random() * 2.2
              : kind === 'mote'
                ? 1.5 + Math.random() * 1.5
                : 4.0 + Math.random() * 3.6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.016,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.015 + Math.random() * 0.015,
          kind,
          colorIdx: idx % 3,
          alpha: 0.34 + Math.random() * 0.28,
        };
      }
    );

    const birds: BirdSilhouette[] = Array.from(
      { length: isMobile ? 3 : 5 },
      (_, idx) => ({
        x: width * (0.12 + idx * 0.17) + (Math.random() - 0.5) * 36,
        y: height * (0.12 + (idx % 3) * 0.05),
        speed: 0.3 + idx * 0.05,
        scale: 0.72 + (idx % 3) * 0.2,
        wingPhase: idx * 1.15,
        wingSpeed: 0.052 + (idx % 2) * 0.012,
      })
    );

    const dayPetals = ['#B66E80', '#D4AE7A', '#C89284'];
    const duskPetals = ['#EAA4B6', '#F0C782', '#D4B2C2'];
    const goldenMotes = ['#EBC478', '#F4DDA6', '#E49EB0'];

    let smoothedVelocity = 0;
    let rafId = 0;

    const drawFrame = () => {
      const metrics = getScrollMetrics();
      const stage = activeStageRef.current;
      const clampedVel = Math.max(-42, Math.min(42, metrics.velocity));
      smoothedVelocity += (clampedVel - smoothedVelocity) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Distant gliding birds across #beranda & #dedikasi morning highland sky.
      const birdVisibility = Math.max(0, 1 - metrics.progress * 3.4);
      if (birdVisibility > 0.02) {
        ctx.save();
        ctx.strokeStyle =
          isDark || stage === 6
            ? `rgba(232, 222, 228, ${0.3 * birdVisibility})`
            : `rgba(72, 81, 91, ${0.34 * birdVisibility})`;
        ctx.lineWidth = 1.25;
        ctx.lineCap = 'round';

        for (const bird of birds) {
          bird.x += bird.speed + smoothedVelocity * 0.055;
          bird.wingPhase += bird.wingSpeed;
          if (bird.x > width + 60) bird.x = -50;
          else if (bird.x < -60) bird.x = width + 50;

          const wingLift = Math.sin(bird.wingPhase) * 3.5 * bird.scale;
          const span = 10 * bird.scale;
          const by = bird.y - metrics.scrollY * 0.035;

          ctx.beginPath();
          ctx.moveTo(bird.x - span, by - wingLift);
          ctx.quadraticCurveTo(
            bird.x - span * 0.4,
            by - 3.4 * bird.scale,
            bird.x,
            by
          );
          ctx.quadraticCurveTo(
            bird.x + span * 0.4,
            by - 3.4 * bird.scale,
            bird.x + span,
            by - wingLift
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      const isTwilightOrNight = isDark || stage === 6 || stage === 7;
      const petalColors = isTwilightOrNight ? duskPetals : dayPetals;

      for (const p of particles) {
        p.phase += p.phaseSpeed;
        const swayX = Math.sin(p.phase) * 0.4;

        // In #surat, #lilin, and #ucapan, particles float gently upward like warm wax-seal dust / lantern motes.
        const upwardBias = stage >= 5 ? -0.22 : 0;
        p.x += p.vx + swayX - smoothedVelocity * 0.09;
        p.y += p.vy + upwardBias - smoothedVelocity * 0.22;
        p.rotation += p.vRot + smoothedVelocity * 0.002;

        if (p.x > width + 24) p.x = -20;
        if (p.x < -24) p.x = width + 20;
        if (p.y > height + 24) p.y = -20;
        if (p.y < -24) p.y = height + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.kind === 'lantern' || stage >= 5) {
          const glowColor = goldenMotes[p.colorIdx];
          ctx.globalAlpha =
            stage === 6 || stage === 7 ? Math.min(0.82, p.alpha * 1.35) : p.alpha;
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(0, 0, p.kind === 'petal' ? p.size * 0.48 : p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'mote') {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = goldenMotes[p.colorIdx];
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = petalColors[p.colorIdx];
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.54, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(drawFrame);
    };

    window.addEventListener('resize', resize, { passive: true });
    rafId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [getScrollMetrics, isDark]);

  // Gouache watercolor palette tokens
  const stemPrimary = isDark ? '#546159' : '#525E50';
  const stemSecondary = isDark ? '#68756C' : '#6D7A68';
  const leafDeep = isDark ? '#27352F' : '#6D7F6B';
  const leafMid = isDark ? '#35473F' : '#8A9B86';
  const leafLight = isDark ? '#465A50' : '#A7B5A1';
  const blossomDeep = isDark ? '#CF7D95' : '#9E475E';
  const blossomMid = isDark ? '#E29BB0' : '#C4778B';
  const blossomPale = isDark ? '#F1C6D2' : '#E7BDC7';
  const stamenGold = isDark ? '#F0CB85' : '#C99B4E';

  return (
    <div
      ref={rootRef}
      data-testid="living-heritage-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* SECTION 1 (#beranda) Base Sky: Soft Morning Archival Sunrise / Starlit Slate */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #12151B 0%, #191B26 52%, #211D29 100%)'
            : 'linear-gradient(180deg, #F7EDE4 0%, #F6F1E9 52%, #F4F2EC 100%)',
        }}
      />

      {/* SECTION 2 (#dedikasi) Mood: Warm Sunlit Highland Morning Mist */}
      <div
        ref={moodDedikasiRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #141922 0%, #1D232E 54%, #24232E 100%)'
            : 'linear-gradient(180deg, #F8F0DF 0%, #F4EFE4 55%, #EFECE3 100%)',
        }}
      />

      {/* SECTION 3 (#babak) Mood: Crisp Afternoon Valley Light */}
      <div
        ref={moodBabakRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #131920 0%, #1B232B 54%, #20262D 100%)'
            : 'linear-gradient(180deg, #EEF2E7 0%, #F3F0E6 54%, #E9E6DC 100%)',
        }}
      />

      {/* SECTION 4 (#arsip) Mood: Golden-Hour Sunset Glow (#F5E8DC peach-gold / plum-slate dusk) */}
      <div
        ref={moodArsipRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #1B1625 0%, #2A1E2D 54%, #382430 100%)'
            : 'linear-gradient(180deg, #F5E8DC 0%, #F2DEC9 54%, #ECD4BF 100%)',
        }}
      />

      {/* SECTION 5 (#surat) Mood: Intimate Twilight Rose-Parchment Vignette */}
      <div
        ref={moodSuratRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 48%, #251C29 0%, #1A1522 65%, #12131C 100%)'
            : 'radial-gradient(circle at 50% 48%, #F6ECE8 0%, #EFE0DC 62%, #E4D0CC 100%)',
        }}
      />

      {/* SECTION 6 (#lilin) Mood: Magical Romantic Evening Twilight Dusk (active in BOTH Light & Dark themes!) */}
      <div
        ref={moodLilinRef}
        data-testid="backdrop-twilight-dusk"
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'linear-gradient(180deg, #121120 0%, #22192E 48%, #351F2F 82%, #241824 100%)',
        }}
      />

      {/* SECTION 7 (#ucapan) Mood: Calm Moonlit Lantern Garden / Soft Dawn Return */}
      <div
        ref={moodUcapanRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #121620 0%, #19202C 56%, #202532 100%)'
            : 'linear-gradient(180deg, #E9E5DF 0%, #F3EEE6 52%, #FAF8F4 100%)',
        }}
      />

      {/* SECTION 2 SCENERY: Diagonal Highland Sunbeams, High Clouds & Minangkabau Songket Watermarks */}
      <div ref={sunbeamsAndSongketRef} className="absolute inset-0 opacity-0">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="highland-sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={isDark ? '#F2D59B' : '#FFF8E6'}
                stopOpacity={isDark ? '0.11' : '0.45'}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#F2D59B' : '#FFF8E6'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Soft diagonal highland sunbeam washes */}
          <polygon points="120,0 430,0 920,900 540,900" fill="url(#highland-sunbeam)" />
          <polygon points="560,0 790,0 1260,900 980,900" fill="url(#highland-sunbeam)" opacity="0.7" />

          {/* Floating high-altitude Bukit Barisan cloud layers */}
          <path
            d="M80 185 Q190 155 310 176 T540 172 Q620 182 520 198 L110 198 Z"
            fill={isDark ? '#D5DCE6' : '#FFFFFF'}
            opacity={isDark ? '0.06' : '0.42'}
          />
          <path
            d="M920 148 Q1045 120 1175 142 T1380 140 Q1415 154 1340 165 L940 165 Z"
            fill={isDark ? '#D5DCE6' : '#FFFFFF'}
            opacity={isDark ? '0.06' : '0.38'}
          />

          {/* Whisper-thin Minangkabau songket / pucuk rebung watermarks on outer margins (opacity: 0.08) */}
          <g
            stroke={isDark ? '#E8A3B5' : '#7D223C'}
            strokeWidth="1.1"
            fill="none"
            opacity="0.08"
          >
            {[160, 320, 480, 640].map((cy) => (
              <g key={`left-songket-${cy}`} transform={`translate(58, ${cy})`}>
                <polygon points="0,-46 34,0 0,46 -34,0" />
                <polygon points="0,-26 19,0 0,26 -19,0" />
                <circle cx="0" cy="0" r="5" />
              </g>
            ))}
            {[160, 320, 480, 640].map((cy) => (
              <g key={`right-songket-${cy}`} transform={`translate(1382, ${cy})`}>
                <polygon points="0,-46 34,0 0,46 -34,0" />
                <polygon points="0,-26 19,0 0,26 -19,0" />
                <circle cx="0" cy="0" r="5" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* SECTION 4 SCENERY: Golden-Hour Low Sunset Disc & Counter-Parallax Horizon Glow */}
      <div ref={archiveSunsetHaloRef} className="absolute inset-0 opacity-0">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <radialGradient id="archive-sunset-disc" cx="72%" cy="56%" r="34%">
              <stop
                offset="0%"
                stopColor={isDark ? '#EAA4B6' : '#F6C58E'}
                stopOpacity={isDark ? '0.26' : '0.52'}
              />
              <stop
                offset="52%"
                stopColor={isDark ? '#9E5874' : '#EFA985'}
                stopOpacity={isDark ? '0.11' : '0.22'}
              />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#archive-sunset-disc)" />
          <circle
            cx="1036"
            cy="486"
            r="68"
            fill={isDark ? '#F0B694' : '#FCE1B6'}
            opacity={isDark ? '0.16' : '0.44'}
          />
        </svg>
      </div>

      {/* Sky Horizon Ambient Haze + Evening / Section 6 Twinkling Stars */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="minang-horizon-glow" cx="52%" cy="68%" r="45%">
            <stop
              offset="0%"
              stopColor={isDark ? '#E8A3B5' : '#F3D4B3'}
              stopOpacity={isDark ? '0.15' : '0.35'}
            />
            <stop offset="100%" stopColor={isDark ? '#13161B' : '#FAF8F4'} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#minang-horizon-glow)" />

        {/* Twinkling stars visible permanently in Evening Dark Mode AND revealed during Section 6 (#lilin) Twilight! */}
        <g
          ref={twilightStarsRef}
          style={{ opacity: isDark ? 0.68 : 0 }}
          fill="#F7F5EE"
        >
          <circle cx="142" cy="96" r="1.3" opacity="0.8" />
          <circle cx="264" cy="148" r="1.0" opacity="0.55" />
          <circle cx="358" cy="74" r="1.6" opacity="0.85" />
          <circle cx="486" cy="128" r="1.1" opacity="0.6" />
          <circle cx="618" cy="66" r="1.4" opacity="0.75" />
          <circle cx="744" cy="116" r="1.0" opacity="0.55" />
          <circle cx="868" cy="82" r="1.7" opacity="0.9" />
          <circle cx="992" cy="138" r="1.2" opacity="0.65" />
          <circle cx="1126" cy="72" r="1.5" opacity="0.8" />
          <circle cx="1248" cy="124" r="1.1" opacity="0.65" />
          <circle cx="1346" cy="88" r="1.4" opacity="0.75" />
          <circle cx="212" cy="218" r="0.9" opacity="0.45" />
          <circle cx="536" cy="196" r="1.1" opacity="0.5" />
          <circle cx="1064" cy="204" r="1.0" opacity="0.5" />
          <circle cx="1296" cy="192" r="1.1" opacity="0.5" />
          {/* Delicate 4-point evening star glints */}
          <path
            d="M358 67 L359.4 72.6 L365 74 L359.4 75.4 L358 81 L356.6 75.4 L351 74 L356.6 72.6 Z"
            fill="#F9E3B4"
            opacity="0.75"
          />
          <path
            d="M868 75 L869.5 80.5 L875 82 L869.5 83.5 L868 89 L866.5 83.5 L861 82 L866.5 80.5 Z"
            fill="#F9E3B4"
            opacity="0.8"
          />
          <path
            d="M1126 65 L1127.3 70.7 L1133 72 L1127.3 73.3 L1126 79 L1124.7 73.3 L1119 72 L1124.7 70.7 Z"
            fill="#F9E3B4"
            opacity="0.7"
          />
        </g>
      </svg>

      {/* LAYER 2: Multi-Layered Gouache Bukit Barisan Mountains & Drifting Mist Bands */}
      <div
        ref={mountainsRef}
        data-testid="backdrop-mountains"
        className="absolute inset-x-0 bottom-[9%] h-[45vh] will-change-transform"
      >
        <svg
          viewBox="0 0 1440 440"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="bukit-distant-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#252334' : '#DECBC7'} stopOpacity="0.78" />
              <stop offset="100%" stopColor={isDark ? '#1A1D28' : '#EAE1D7'} stopOpacity="0.92" />
            </linearGradient>
            <linearGradient id="bukit-ochre-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#212633' : '#D7C6B2'} stopOpacity="0.86" />
              <stop offset="100%" stopColor={isDark ? '#171C25' : '#E4DDD0'} stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="bukit-sage-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1B232B' : '#B9C0AE'} stopOpacity="0.9" />
              <stop offset="100%" stopColor={isDark ? '#141920' : '#CFD3C4'} stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id="valley-mist-band" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isDark ? '#C8D2E0' : '#FFFDF9'}
                stopOpacity={isDark ? '0.09' : '0.58'}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#C8D2E0' : '#FFFDF9'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Far rose-taupe Singgalang / Marapi silhouette */}
          <path
            d="M0 232 Q145 148 290 186 Q455 104 630 176 Q810 128 995 174 Q1185 96 1355 162 L1440 148 L1440 440 L0 440 Z"
            fill="url(#bukit-distant-grad)"
          />

          {/* Translucent drifting mist ribbon 1 */}
          <path
            ref={mistBackRef}
            d="M-120 218 Q210 192 540 216 T1180 206 T1560 220 L1560 282 L-120 282 Z"
            fill="url(#valley-mist-band)"
          />

          {/* Warm misty ochre mid-mountain ridge */}
          <path
            d="M0 276 Q165 208 335 246 Q520 172 710 236 Q890 182 1075 232 Q1255 174 1440 228 L1440 440 L0 440 Z"
            fill="url(#bukit-ochre-grad)"
          />

          {/* Translucent drifting mist ribbon 2 */}
          <path
            ref={mistFrontRef}
            d="M-120 278 Q280 254 660 280 T1320 268 L1560 276 L1560 338 L-120 338 Z"
            fill="url(#valley-mist-band)"
          />

          {/* Closer sage-olive forested foothills */}
          <path
            d="M0 326 Q220 270 465 304 Q725 252 995 298 Q1235 262 1440 294 L1440 440 L0 440 Z"
            fill="url(#bukit-sage-grad)"
          />
        </svg>
      </div>

      {/* LAYER 3: Intricate Rumah Gadang, Terraced Foothills & Shimmering Sungai Sirah Valley */}
      <div
        ref={valleyRef}
        data-testid="backdrop-rumah-gadang"
        className="absolute inset-x-0 bottom-[-4%] h-[39vh] will-change-transform"
      >
        <svg
          viewBox="0 0 1440 390"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="terrace-slope-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1A2128' : '#C8CCB9'} />
              <stop offset="100%" stopColor={isDark ? '#141920' : '#B7BDA9'} />
            </linearGradient>
            <linearGradient id="meadow-front-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#151B22' : '#BCC1AE'} />
              <stop offset="100%" stopColor={isDark ? '#10141A' : '#AEB49F'} />
            </linearGradient>
            <linearGradient id="gonjong-roof-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#0B0E13' : '#2E2524'} />
              <stop offset="100%" stopColor={isDark ? '#1A1F28' : '#4C3D3A'} />
            </linearGradient>
            <linearGradient id="timber-wall-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1E232C' : '#655046'} />
              <stop offset="100%" stopColor={isDark ? '#14181F' : '#493933'} />
            </linearGradient>
            <linearGradient id="sungai-sirah-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#2B3948' : '#D9E3E2'} stopOpacity="0.9" />
              <stop offset="55%" stopColor={isDark ? '#38495B' : '#E7EFEF'} stopOpacity="0.94" />
              <stop offset="100%" stopColor={isDark ? '#23303E' : '#CBD8D7'} stopOpacity="0.96" />
            </linearGradient>
            <radialGradient id="amber-window-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD88A" stopOpacity="0.68" />
              <stop offset="55%" stopColor="#E9A34B" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#E9A34B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Terraced Minang valley slope with subtle sawah contour lines */}
          <path
            d="M0 240 Q270 194 555 228 Q855 180 1155 218 Q1315 204 1440 222 L1440 390 L0 390 Z"
            fill="url(#terrace-slope-grad)"
          />
          <path
            d="M40 256 Q290 218 545 244 M760 228 Q980 204 1230 232"
            fill="none"
            stroke={isDark ? '#2B3540' : '#DDE0D2'}
            strokeWidth="1.2"
            opacity="0.55"
          />

          {/* Graceful coconut palms framing the valley */}
          <g
            stroke={isDark ? '#11151B' : '#4A3E39'}
            fill={isDark ? '#11151B' : '#4A3E39'}
            opacity={isDark ? '0.58' : '0.42'}
          >
            <path d="M192 232 Q198 190 186 158" strokeWidth="2.6" fill="none" />
            <path d="M186 158 Q166 151 150 165 Q168 159 186 161 Q204 150 220 164 Q202 159 186 158 Z" />
            <path d="M186 158 Q172 140 158 145 Q174 148 186 158 Q198 139 214 145 Q198 150 186 158 Z" />

            <path d="M1264 226 Q1258 186 1270 154" strokeWidth="2.5" fill="none" />
            <path d="M1270 154 Q1250 147 1236 160 Q1252 155 1270 157 Q1288 147 1302 159 Q1286 155 1270 154 Z" />
            <path d="M1270 154 Q1256 138 1244 143 Q1258 145 1270 154 Q1282 136 1296 142 Q1282 146 1270 154 Z" />
          </g>

          {/* Distant secondary Rumah Gadang across the western hillside */}
          <g transform="translate(248, 156) scale(0.56)" opacity={isDark ? '0.6' : '0.38'}>
            <path d="M36 62 L270 62 L262 92 L44 92 Z" fill="url(#timber-wall-grad)" />
            <path
              d="M8 66 C20 42, 34 24, 42 6 C48 28, 62 44, 78 46 C88 34, 96 20, 102 2 C110 26, 128 38, 153 38 C178 38, 196 26, 204 2 C210 20, 218 34, 228 46 C244 44, 258 28, 264 6 C272 24, 286 42, 298 66 Q153 57 8 66 Z"
              fill="url(#gonjong-roof-grad)"
            />
          </g>

          {/* HERO ARCHITECTURAL RUMAH GADANG (Positioned on right hillside so center sky stays open for cover text) */}
          <g transform="translate(852, 110)" opacity={isDark ? '0.94' : '0.78'}>
            {/* Ground shadow under stilts */}
            <ellipse
              cx="154"
              cy="115"
              rx="124"
              ry="6"
              fill={isDark ? '#090B0E' : '#8E9380'}
              opacity="0.45"
            />

            {/* Elevated timber stilts (tonggak) with cross-bracing */}
            <g stroke={isDark ? '#12161D' : '#3F312C'} strokeWidth="2.6">
              {[46, 76, 106, 136, 170, 200, 230, 260].map((sx) => (
                <line key={sx} x1={sx} y1="90" x2={sx} y2="115" />
              ))}
              <line x1="46" y1="101" x2="260" y2="101" strokeWidth="1.3" opacity="0.65" />
            </g>

            {/* Traditional outward-slanted timber facade (dinding tapi) + side anjuang wings */}
            <path d="M22 58 L38 62 L44 90 L28 86 Z" fill="url(#timber-wall-grad)" />
            <path d="M284 58 L268 62 L262 90 L278 86 Z" fill="url(#timber-wall-grad)" />
            <path d="M36 62 L270 62 L262 91 L44 91 Z" fill="url(#timber-wall-grad)" />

            {/* Carved ukiran Minang gold-ochre fascia bands */}
            <line
              x1="36"
              y1="66.5"
              x2="270"
              y2="66.5"
              stroke={isDark ? '#9A7B56' : '#B58D5D'}
              strokeWidth="1.8"
              opacity="0.82"
            />
            <line
              x1="42"
              y1="87.5"
              x2="264"
              y2="87.5"
              stroke={isDark ? '#826748' : '#A47E52'}
              strokeWidth="1.2"
              opacity="0.7"
            />

            {/* Central entrance doorway & carved janjang stairs */}
            <rect
              x="145"
              y="70"
              width="16"
              height="20"
              rx="1.5"
              fill={isDark ? '#0E1117' : '#2D221F'}
            />
            <path d="M142 90 L164 90 L169 115 L137 115 Z" fill="url(#gonjong-roof-grad)" />
            <g stroke={isDark ? '#78624A' : '#9B7B56'} strokeWidth="1" opacity="0.65">
              <line x1="141" y1="96" x2="165" y2="96" />
              <line x1="139" y1="102" x2="167" y2="102" />
              <line x1="138" y1="108" x2="168" y2="108" />
            </g>

            {/* Multi-tiered sweeping curved Atap Gonjong with finial spires */}
            <path
              d="
                M4 64
                C18 40, 30 22, 38 3
                C45 27, 60 43, 77 45
                C87 32, 95 17, 102 -2
                C110 24, 128 37, 153 37
                C178 37, 196 24, 204 -2
                C211 17, 219 32, 229 45
                C246 43, 261 27, 268 3
                C276 22, 288 40, 302 64
                Q228 56, 153 58
                Q78 56, 4 64 Z
              "
              fill="url(#gonjong-roof-grad)"
            />
            {/* Elevated central gonjong crown */}
            <path
              d="M124 46 C138 33, 147 14, 153 -11 C159 14, 168 33, 182 46 Q153 42 124 46 Z"
              fill="url(#gonjong-roof-grad)"
            />
            {/* Metallic gonjong spire finials & ridge highlights */}
            <g
              stroke={isDark ? '#B99768' : '#C39B66'}
              strokeWidth="1.2"
              fill="none"
              opacity="0.72"
            >
              <path d="M14 62 Q84 53 153 55 Q222 53 292 62" />
              <path d="M38 3 L36 -3 M102 -2 L101 -8 M153 -11 L153 -18 M204 -2 L205 -8 M268 3 L270 -3" />
            </g>

            {/* Glowing Amber Windows (illuminate warmly in Evening Dark Mode & Section 6 #lilin Twilight!) */}
            <g
              ref={lanternsRef}
              data-testid="rumah-gadang-lanterns"
              opacity={isDark ? '0.68' : '0.24'}
            >
              {[58, 86, 114, 180, 208, 236].map((wx) => (
                <g key={wx}>
                  <circle cx={wx + 5.5} cy={77} r={14} fill="url(#amber-window-halo)" />
                  <rect
                    x={wx}
                    y={71}
                    width={11}
                    height={12}
                    rx={1.5}
                    fill="#F7CF80"
                  />
                  <line
                    x1={wx + 5.5}
                    y1={71}
                    x2={wx + 5.5}
                    y2={83}
                    stroke="#5B3F28"
                    strokeWidth="0.9"
                  />
                </g>
              ))}
            </g>

            {/* Companion Rangkiang (carved rice granary) */}
            <g transform="translate(-62, 34)">
              <line
                x1="14"
                y1="55"
                x2="14"
                y2="78"
                stroke={isDark ? '#12161D' : '#3F312C'}
                strokeWidth="2.1"
              />
              <line
                x1="34"
                y1="55"
                x2="34"
                y2="78"
                stroke={isDark ? '#12161D' : '#3F312C'}
                strokeWidth="2.1"
              />
              <path d="M9 36 L39 36 L35 56 L13 56 Z" fill="url(#timber-wall-grad)" />
              <line
                x1="10"
                y1="40"
                x2="38"
                y2="40"
                stroke={isDark ? '#9A7B56' : '#B58D5D'}
                strokeWidth="1.2"
              />
              <path
                d="M1 38 C8 23, 13 13, 17 2 C20 17, 28 17, 31 2 C35 13, 40 23, 47 38 Q24 32 1 38 Z"
                fill="url(#gonjong-roof-grad)"
              />
            </g>
          </g>

          {/* Foreground rolling meadow */}
          <path
            d="M0 268 Q340 234 685 270 Q1045 240 1440 274 L1440 390 L0 390 Z"
            fill="url(#meadow-front-grad)"
          />

          {/* Winding Sungai Sirah river with scroll-reactive shimmering specular highlight */}
          <path
            d="M670 258 C612 278, 764 298, 650 330 C572 352, 490 366, 412 390 L562 390 C630 364, 734 344, 770 318 C812 288, 686 274, 710 256 Z"
            fill="url(#sungai-sirah-water)"
          />
          <path
            ref={riverShimmerRef}
            d="M686 264 C642 280, 750 298, 670 326 C608 348, 536 364, 482 384"
            fill="none"
            stroke={isDark ? '#F5DCA8' : '#FFFFFF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="18 14 8 16"
          />
        </svg>
      </div>

      {/* Section 6 (#lilin) nocturnal valley glaze so Light Mode hills also bathe in romantic dusk */}
      <div
        ref={twilightValleyGlazeRef}
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply"
        style={{
          background:
            'linear-gradient(180deg, rgba(24, 20, 38, 0.35) 0%, rgba(20, 18, 34, 0.82) 56%, rgba(16, 15, 28, 0.92) 100%)',
        }}
      />

      {/* SECTION 3 SCENERY: Alternating Painterly Floral Sprigs & Pressed-Leaf Accents (#babak) */}
      <div ref={chapterSprigsRef} className="absolute inset-0 opacity-0 will-change-transform">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Left pressed botanical sprig */}
          <g transform="translate(-14, 270)" opacity={isDark ? '0.5' : '0.62'}>
            <path
              d="M0 140 C48 118, 92 88, 134 42"
              stroke={stemPrimary}
              strokeWidth="2.2"
              fill="none"
            />
            <ellipse cx="56" cy="112" rx="22" ry="8" transform="rotate(-28 56 112)" fill={leafDeep} />
            <ellipse cx="92" cy="82" rx="20" ry="7.5" transform="rotate(18 92 82)" fill={leafMid} />
            <ellipse cx="118" cy="54" rx="17" ry="6.5" transform="rotate(-36 118 54)" fill={leafLight} />
            <circle cx="136" cy="40" r="8" fill={blossomMid} />
            <circle cx="136" cy="40" r="3" fill={stamenGold} />
          </g>

          {/* Right pressed botanical sprig */}
          <g transform="translate(1454, 520) scale(-1, 1)" opacity={isDark ? '0.5' : '0.62'}>
            <path
              d="M0 140 C48 118, 92 88, 134 42"
              stroke={stemPrimary}
              strokeWidth="2.2"
              fill="none"
            />
            <ellipse cx="56" cy="112" rx="22" ry="8" transform="rotate(-28 56 112)" fill={leafDeep} />
            <ellipse cx="92" cy="82" rx="20" ry="7.5" transform="rotate(18 92 82)" fill={leafMid} />
            <ellipse cx="118" cy="54" rx="17" ry="6.5" transform="rotate(-36 118 54)" fill={leafLight} />
            <circle cx="136" cy="40" r="8" fill={blossomPale} />
            <circle cx="136" cy="40" r="3" fill={stamenGold} />
          </g>
        </svg>
      </div>

      {/* SECTION 5 SCENERY: Delicate Pressed-Flower Corner Silhouettes (#surat) */}
      <div ref={letterPressedFloralRef} className="absolute inset-0 opacity-0">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="h-full w-full">
          <g fill={blossomMid} stroke={stemPrimary} strokeWidth="1.4" opacity={isDark ? '0.26' : '0.34'}>
            <g transform="translate(36, 92)">
              <path d="M0 90 Q28 42 78 12" fill="none" />
              <ellipse cx="34" cy="52" rx="16" ry="6" transform="rotate(-35 34 52)" fill={leafMid} stroke="none" />
              <circle cx="78" cy="12" r="10" stroke="none" />
            </g>
            <g transform="translate(1404, 92) scale(-1, 1)">
              <path d="M0 90 Q28 42 78 12" fill="none" />
              <ellipse cx="34" cy="52" rx="16" ry="6" transform="rotate(-35 34 52)" fill={leafMid} stroke="none" />
              <circle cx="78" cy="12" r="10" stroke="none" />
            </g>
          </g>
        </svg>
      </div>

      {/* LAYER 4: Lush Layered Gouache Botanical Canopies (Left & Right Curtains) */}
      <div
        ref={leftBranchRef}
        data-testid="backdrop-canopy-left"
        className="absolute -left-6 top-4 w-40 sm:w-56 md:w-76 lg:w-96 opacity-85 md:opacity-96 will-change-transform"
      >
        <div className="animate-breeze-left">
          <svg viewBox="0 0 360 500" className="h-auto w-full" fill="none">
            <defs>
              <radialGradient id="gouache-petal-a" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor={blossomPale} />
                <stop offset="68%" stopColor={blossomMid} />
                <stop offset="100%" stopColor={blossomDeep} />
              </radialGradient>
              <radialGradient id="gouache-petal-b" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFF7F8" stopOpacity="0.9" />
                <stop offset="55%" stopColor={blossomPale} />
                <stop offset="100%" stopColor={blossomMid} />
              </radialGradient>
            </defs>

            {/* Layered woody branches */}
            <path
              d="M-16 36 C74 58, 152 106, 224 176 C254 205, 284 226, 314 238"
              stroke={stemPrimary}
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M-12 142 C60 162, 118 202, 168 264 C190 292, 208 318, 222 348"
              stroke={stemPrimary}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M78 82 C116 58, 160 48, 208 58"
              stroke={stemSecondary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M126 216 C94 252, 72 294, 58 344"
              stroke={stemSecondary}
              strokeWidth="1.9"
              strokeLinecap="round"
            />

            {/* Background depth foliage */}
            <g fill={leafDeep} opacity="0.86">
              <ellipse cx="64" cy="64" rx="25" ry="10" transform="rotate(-22 64 64)" />
              <ellipse cx="132" cy="84" rx="28" ry="11" transform="rotate(-12 132 84)" />
              <ellipse cx="182" cy="148" rx="26" ry="10.5" transform="rotate(34 182 148)" />
              <ellipse cx="92" cy="190" rx="28" ry="11" transform="rotate(24 92 190)" />
              <ellipse cx="148" cy="252" rx="24" ry="9.5" transform="rotate(42 148 252)" />
              <ellipse cx="72" cy="296" rx="22" ry="9" transform="rotate(-46 72 296)" />
            </g>

            {/* Midground sunlit sage leaves */}
            <g fill={leafMid} opacity="0.82">
              <ellipse cx="98" cy="112" rx="22" ry="8.5" transform="rotate(30 98 112)" />
              <ellipse cx="198" cy="62" rx="24" ry="9" transform="rotate(-6 198 62)" />
              <ellipse cx="252" cy="204" rx="23" ry="8.8" transform="rotate(18 252 204)" />
              <ellipse cx="52" cy="164" rx="20" ry="8" transform="rotate(-18 52 164)" />
              <ellipse cx="188" cy="312" rx="22" ry="8.5" transform="rotate(50 188 312)" />
            </g>

            {/* Foreground highlight leaves */}
            <g fill={leafLight} opacity="0.74">
              <ellipse cx="154" cy="54" rx="18" ry="7" transform="rotate(-18 154 54)" />
              <ellipse cx="282" cy="228" rx="19" ry="7.2" transform="rotate(12 282 228)" />
              <ellipse cx="118" cy="284" rx="18" ry="7" transform="rotate(-26 118 284)" />
            </g>

            {/* Layered Gouache Camellia & Champaca Blossoms */}
            {[
              { cx: 162, cy: 116, r: 20, alt: false },
              { cx: 238, cy: 184, r: 16, alt: true },
              { cx: 116, cy: 212, r: 18, alt: false },
              { cx: 204, cy: 288, r: 13, alt: true },
              { cx: 62, cy: 122, r: 14, alt: true },
              { cx: 214, cy: 62, r: 12, alt: false },
            ].map((flower, i) => (
              <g key={i} transform={`translate(${flower.cx}, ${flower.cy})`}>
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse
                    key={`outer-${deg}`}
                    cx={0}
                    cy={-flower.r * 0.58}
                    rx={flower.r * 0.44}
                    ry={flower.r * 0.66}
                    fill={flower.alt ? 'url(#gouache-petal-b)' : 'url(#gouache-petal-a)'}
                    opacity="0.92"
                    transform={`rotate(${deg})`}
                  />
                ))}
                {[30, 102, 174, 246, 318].map((deg) => (
                  <ellipse
                    key={`inner-${deg}`}
                    cx={0}
                    cy={-flower.r * 0.36}
                    rx={flower.r * 0.3}
                    ry={flower.r * 0.44}
                    fill="url(#gouache-petal-b)"
                    opacity="0.88"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx={0} cy={0} r={flower.r * 0.22} fill={stamenGold} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div
        ref={rightBranchRef}
        data-testid="backdrop-canopy-right"
        className="absolute -right-6 top-4 w-40 sm:w-56 md:w-76 lg:w-96 opacity-85 md:opacity-96 will-change-transform"
      >
        <div className="animate-breeze-right">
          <svg viewBox="0 0 360 500" className="h-auto w-full -scale-x-100" fill="none">
            <path
              d="M-16 44 C74 68, 152 114, 224 184 C254 212, 284 234, 314 246"
              stroke={stemPrimary}
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <path
              d="M-12 152 C60 172, 118 212, 168 274 C190 302, 208 328, 222 356"
              stroke={stemPrimary}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M78 92 C116 68, 160 58, 208 68"
              stroke={stemSecondary}
              strokeWidth="2"
              strokeLinecap="round"
            />

            <g fill={leafDeep} opacity="0.86">
              <ellipse cx="64" cy="74" rx="25" ry="10" transform="rotate(-22 64 74)" />
              <ellipse cx="132" cy="94" rx="28" ry="11" transform="rotate(-12 132 94)" />
              <ellipse cx="182" cy="158" rx="26" ry="10.5" transform="rotate(34 182 158)" />
              <ellipse cx="92" cy="200" rx="28" ry="11" transform="rotate(24 92 200)" />
              <ellipse cx="148" cy="262" rx="24" ry="9.5" transform="rotate(42 148 262)" />
            </g>
            <g fill={leafMid} opacity="0.82">
              <ellipse cx="98" cy="122" rx="22" ry="8.5" transform="rotate(30 98 122)" />
              <ellipse cx="198" cy="72" rx="24" ry="9" transform="rotate(-6 198 72)" />
              <ellipse cx="252" cy="214" rx="23" ry="8.8" transform="rotate(18 252 214)" />
              <ellipse cx="52" cy="174" rx="20" ry="8" transform="rotate(-18 52 174)" />
              <ellipse cx="188" cy="322" rx="22" ry="8.5" transform="rotate(50 188 322)" />
            </g>
            <g fill={leafLight} opacity="0.74">
              <ellipse cx="154" cy="64" rx="18" ry="7" transform="rotate(-18 154 64)" />
              <ellipse cx="282" cy="238" rx="19" ry="7.2" transform="rotate(12 282 238)" />
            </g>

            {[
              { cx: 166, cy: 126, r: 19, alt: true },
              { cx: 242, cy: 194, r: 15, alt: false },
              { cx: 120, cy: 222, r: 17, alt: true },
              { cx: 202, cy: 298, r: 13, alt: false },
              { cx: 66, cy: 132, r: 14, alt: false },
            ].map((flower, i) => (
              <g key={i} transform={`translate(${flower.cx}, ${flower.cy})`}>
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse
                    key={`r-outer-${deg}`}
                    cx={0}
                    cy={-flower.r * 0.58}
                    rx={flower.r * 0.44}
                    ry={flower.r * 0.66}
                    fill={flower.alt ? 'url(#gouache-petal-b)' : 'url(#gouache-petal-a)'}
                    opacity="0.92"
                    transform={`rotate(${deg})`}
                  />
                ))}
                {[30, 102, 174, 246, 318].map((deg) => (
                  <ellipse
                    key={`r-inner-${deg}`}
                    cx={0}
                    cy={-flower.r * 0.36}
                    rx={flower.r * 0.3}
                    ry={flower.r * 0.44}
                    fill="url(#gouache-petal-b)"
                    opacity="0.88"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx={0} cy={0} r={flower.r * 0.22} fill={stamenGold} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* LAYER 5: Scroll-Reactive Living Atmosphere Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="living-atmosphere-canvas"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* LAYER 6: Ultra-subtle Archival Cotton-Paper Grain (<feTurbulence>, opacity: 0.035) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
      >
        <filter id="archival-cotton-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#archival-cotton-grain)" />
      </svg>
    </div>
  );
}
