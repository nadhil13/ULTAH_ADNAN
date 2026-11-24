import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

interface LivingHeritageBackdropProps {
  isDark: boolean;
}

interface PetalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  phase: number;
  phaseSpeed: number;
  kind: 'petal' | 'pollen';
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
  const skyAfternoonRef = useRef<HTMLDivElement | null>(null);
  const skyTwilightRef = useRef<HTMLDivElement | null>(null);
  const mountainsRef = useRef<HTMLDivElement | null>(null);
  const valleyRef = useRef<HTMLDivElement | null>(null);
  const lanternsRef = useRef<SVGGElement | null>(null);
  const leftBranchRef = useRef<HTMLDivElement | null>(null);
  const rightBranchRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Layers 1-4: Bidirectional scrubbed GSAP ScrollTrigger choreography (alive down AND up).
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Full-document scrubbed timeline for sky shift, mountain parallax, valley parallax, and evening lanterns.
      const docTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      if (skyAfternoonRef.current) {
        docTl.fromTo(
          skyAfternoonRef.current,
          { opacity: 0 },
          { opacity: 1, ease: 'none', duration: 0.5 },
          0.12
        );
      }

      if (skyTwilightRef.current) {
        docTl.fromTo(
          skyTwilightRef.current,
          { opacity: 0 },
          { opacity: 1, ease: 'none', duration: 0.45 },
          0.55
        );
      }

      // Layer 2: Distant Bukit Barisan mountain ridges (0.12x vertical parallax + subtle scale).
      if (mountainsRef.current) {
        docTl.fromTo(
          mountainsRef.current,
          { yPercent: 0, scale: 1 },
          { yPercent: -10, scale: 1.05, ease: 'none', duration: 1 },
          0
        );
      }

      // Layer 3: Midground Rumah Gadang & Sungai Sirah valley (0.28x parallax).
      if (valleyRef.current) {
        docTl.fromTo(
          valleyRef.current,
          { yPercent: 0, scale: 1 },
          { yPercent: -18, scale: 1.08, ease: 'none', duration: 1 },
          0
        );
      }

      // Evening Edition lantern glow deepens softly as the reader travels deeper.
      if (lanternsRef.current) {
        docTl.fromTo(
          lanternsRef.current,
          { opacity: 0.2 },
          { opacity: 0.96, ease: 'none', duration: 0.65 },
          0.15
        );
      }

      // Layer 4: Opening framing botanical canopy parts outward like garden curtains on scroll down,
      // and glides gracefully back inward when scrolling back to y = 0.
      const canopyTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 1.15)}`,
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      if (leftBranchRef.current) {
        canopyTl.fromTo(
          leftBranchRef.current,
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1 },
          { xPercent: -52, yPercent: -8, rotate: -6, opacity: 0.28, ease: 'none', duration: 1 },
          0
        );
      }

      if (rightBranchRef.current) {
        canopyTl.fromTo(
          rightBranchRef.current,
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1 },
          { xPercent: 52, yPercent: -8, rotate: 6, opacity: 0.28, ease: 'none', duration: 1 },
          0
        );
      }
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, [isDark]);

  // Layer 5: Velocity-reactive birds & painterly blossom petals / golden pollen motes (<canvas>).
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    const petalCount = isMobile ? 12 : 22;

    const petals: PetalParticle[] = Array.from({ length: petalCount }, (_, idx) => {
      const isPollen = idx % 3 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.35) * 0.42,
        vy: isPollen ? -0.14 - Math.random() * 0.16 : 0.22 + Math.random() * 0.32,
        size: isPollen ? 1.8 + Math.random() * 1.6 : 4.2 + Math.random() * 3.8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.018,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.016 + Math.random() * 0.016,
        kind: isPollen ? 'pollen' : 'petal',
        colorIdx: idx % 3,
        alpha: isPollen ? 0.38 + Math.random() * 0.25 : 0.34 + Math.random() * 0.28,
      };
    });

    const birds: BirdSilhouette[] = Array.from({ length: isMobile ? 3 : 5 }, (_, idx) => ({
      x: width * (0.14 + idx * 0.16) + (Math.random() - 0.5) * 40,
      y: height * (0.13 + (idx % 3) * 0.055),
      speed: 0.32 + idx * 0.055,
      scale: 0.72 + (idx % 3) * 0.22,
      wingPhase: idx * 1.15,
      wingSpeed: 0.055 + (idx % 2) * 0.012,
    }));

    const lightPetalPalette = ['#B87989', '#D6B688', '#C9968A'];
    const darkPetalPalette = ['#E6A0B2', '#D8B986', '#BFA8B2'];

    let smoothedVelocity = 0;
    let rafId = 0;

    const drawFrame = () => {
      const metrics = getScrollMetrics();
      const clampedVel = Math.max(-45, Math.min(45, metrics.velocity));
      smoothedVelocity += (clampedVel - smoothedVelocity) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Distant gliding birds: serene in upper opening sky, fading gently as user scrolls down.
      const birdVisibility = Math.max(0, 1 - metrics.progress * 3.2);
      if (birdVisibility > 0.02) {
        ctx.save();
        ctx.strokeStyle = isDark
          ? `rgba(229, 214, 219, ${0.28 * birdVisibility})`
          : `rgba(74, 84, 94, ${0.32 * birdVisibility})`;
        ctx.lineWidth = 1.25;
        ctx.lineCap = 'round';

        for (const bird of birds) {
          bird.x += bird.speed + smoothedVelocity * 0.06;
          bird.wingPhase += bird.wingSpeed;
          if (bird.x > width + 60) {
            bird.x = -50;
          } else if (bird.x < -60) {
            bird.x = width + 50;
          }

          const wingLift = Math.sin(bird.wingPhase) * 3.6 * bird.scale;
          const span = 10 * bird.scale;
          const by = bird.y - metrics.scrollY * 0.04;

          ctx.beginPath();
          ctx.moveTo(bird.x - span, by - wingLift);
          ctx.quadraticCurveTo(bird.x - span * 0.4, by - 3.5 * bird.scale, bird.x, by);
          ctx.quadraticCurveTo(bird.x + span * 0.4, by - 3.5 * bird.scale, bird.x + span, by - wingLift);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Painterly blossom petals & golden pollen motes reacting directly to Lenis velocity (up & down).
      const palette = isDark ? darkPetalPalette : lightPetalPalette;
      for (const p of petals) {
        p.phase += p.phaseSpeed;
        const swayX = Math.sin(p.phase) * 0.42;

        // Scrolling down (positive velocity) sweeps petals upward & gently diagonal;
        // scrolling up (negative velocity) lifts and reverses drift naturally.
        p.x += p.vx + swayX - smoothedVelocity * 0.095;
        p.y += p.vy - smoothedVelocity * 0.24;
        p.rotation += p.vRot + smoothedVelocity * 0.0022;

        if (p.x > width + 24) p.x = -20;
        if (p.x < -24) p.x = width + 20;
        if (p.y > height + 24) p.y = -20;
        if (p.y < -24) p.y = height + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = palette[p.colorIdx];

        if (p.kind === 'pollen') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
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

  // Curated theme-aware painterly tones matching Porcelain Monograph & Evening Edition.
  const ridgeFar = isDark ? '#1B1E27' : '#E6DDD3';
  const ridgeMid = isDark ? '#181C24' : '#DBD1C6';
  const ridgeNear = isDark ? '#151920' : '#CFC5BA';
  const hillBack = isDark ? '#1A1F26' : '#D4CFC3';
  const hillFront = isDark ? '#15191F' : '#C5C0B2';
  const riverFill = isDark ? '#27313D' : '#DFE4E3';
  const riverHighlight = isDark ? '#4B5768' : '#F6F7F4';
  const rumahRoof = isDark ? '#0D1014' : '#3C3230';
  const rumahBody = isDark ? '#171B21' : '#564742';
  const rumahTrim = isDark ? '#69574B' : '#9E7D5E';
  const stemColor = isDark ? '#4F5A54' : '#586258';
  const leafDark = isDark ? '#2A3631' : '#7B8A79';
  const leafSoft = isDark ? '#38463F' : '#9BA896';
  const petalMain = isDark ? '#D994A6' : '#B76C7E';
  const petalSoft = isDark ? '#E8BCC7' : '#DFB2BC';
  const petalCenter = isDark ? '#E6C27F' : '#C9A25B';

  return (
    <div
      ref={rootRef}
      data-testid="living-heritage-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* LAYER 1: Dynamic Time-of-Day Sky Canvas */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #131619 0%, #191822 54%, #1E1B24 100%)'
            : 'linear-gradient(180deg, #F6ECE3 0%, #F5F1E9 52%, #F6F7F4 100%)',
        }}
      />

      {/* Mid-scroll sunlit golden afternoon / warm dusk horizon glow */}
      <div
        ref={skyAfternoonRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #131619 0%, #1C1A26 50%, #271E26 100%)'
            : 'linear-gradient(180deg, #F6EEDB 0%, #F4ECE0 52%, #F6F7F4 100%)',
        }}
      />

      {/* Finale warm twilight blush / velvety indigo evening */}
      <div
        ref={skyTwilightRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #111419 0%, #1C1823 55%, #2B1F27 100%)'
            : 'linear-gradient(180deg, #F0E1DD 0%, #F2E9E5 54%, #F6F7F4 100%)',
        }}
      />

      {/* Subtle warm sun/horizon haze & Evening Edition stars */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="minang-horizon-glow" cx="50%" cy="68%" r="44%">
            <stop
              offset="0%"
              stopColor={isDark ? '#E6A0B2' : '#F2D6B8'}
              stopOpacity={isDark ? '0.12' : '0.32'}
            />
            <stop offset="100%" stopColor={isDark ? '#131619' : '#F6F7F4'} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#minang-horizon-glow)" />

        {isDark && (
          <g fill="#F2F3EE" opacity="0.5">
            <circle cx="195" cy="112" r="1.1" opacity="0.65" />
            <circle cx="348" cy="76" r="1.4" opacity="0.5" />
            <circle cx="512" cy="144" r="1.0" opacity="0.55" />
            <circle cx="678" cy="64" r="1.2" opacity="0.45" />
            <circle cx="842" cy="108" r="1.5" opacity="0.6" />
            <circle cx="1014" cy="84" r="1.0" opacity="0.5" />
            <circle cx="1186" cy="136" r="1.3" opacity="0.65" />
            <circle cx="1312" cy="92" r="1.1" opacity="0.45" />
            <circle cx="270" cy="198" r="0.9" opacity="0.4" />
            <circle cx="1115" cy="192" r="0.9" opacity="0.4" />
          </g>
        )}
      </svg>

      {/* LAYER 2: Distant Bukit Barisan Mountain Ridges (0.12x parallax) */}
      <div
        ref={mountainsRef}
        data-testid="backdrop-mountains"
        className="absolute inset-x-0 bottom-[10%] h-[42vh] will-change-transform"
      >
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {/* Far misty ridge */}
          <path
            d="M0 245 Q170 155 340 198 T690 165 T1070 192 T1440 150 L1440 420 L0 420 Z"
            fill={ridgeFar}
            opacity="0.72"
          />
          {/* Middle Bukit Barisan peaks */}
          <path
            d="M0 285 Q140 220 295 254 Q465 182 640 242 Q815 190 980 238 Q1190 175 1440 235 L1440 420 L0 420 Z"
            fill={ridgeMid}
            opacity="0.82"
          />
          {/* Closer misty foothill ridge */}
          <path
            d="M0 328 Q230 272 480 302 Q740 258 1020 298 Q1250 264 1440 294 L1440 420 L0 420 Z"
            fill={ridgeNear}
            opacity="0.88"
          />
        </svg>
      </div>

      {/* LAYER 3: Midground Rumah Gadang & Sungai Sirah Valley (0.28x parallax) */}
      <div
        ref={valleyRef}
        data-testid="backdrop-rumah-gadang"
        className="absolute inset-x-0 bottom-[-4%] h-[38vh] will-change-transform"
      >
        <svg
          viewBox="0 0 1440 380"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          {/* Gentle terraced valley slope behind Rumah Gadang */}
          <path
            d="M0 238 Q280 194 560 226 Q860 180 1160 218 Q1315 204 1440 222 L1440 380 L0 380 Z"
            fill={hillBack}
          />

          {/* Subtle palm / hillside silhouettes framing the valley */}
          <g fill={rumahBody} opacity={isDark ? '0.42' : '0.32'}>
            <path d="M188 228 Q192 192 184 166" stroke={rumahBody} strokeWidth="2.4" fill="none" />
            <path d="M184 166 Q168 160 156 172 Q170 168 184 169 Q198 160 212 170 Q198 167 184 166 Z" />
            <path d="M184 166 Q172 150 162 154 Q175 156 184 166 Q192 148 205 153 Q193 158 184 166 Z" />

            <path d="M1248 222 Q1244 188 1252 162" stroke={rumahBody} strokeWidth="2.4" fill="none" />
            <path d="M1252 162 Q1236 156 1224 168 Q1238 164 1252 165 Q1266 156 1280 166 Q1266 163 1252 162 Z" />
            <path d="M1252 162 Q1240 146 1230 150 Q1243 152 1252 162 Q1260 144 1273 149 Q1261 154 1252 162 Z" />
          </g>

          {/* Architectural Rumah Gadang Silhouette with iconic curved Atap Gonjong */}
          <g transform="translate(860, 114)" opacity={isDark ? '0.88' : '0.58'}>
            {/* Main elevated stilts */}
            <g stroke={rumahBody} strokeWidth="2.4">
              <line x1="48" y1="88" x2="48" y2="112" />
              <line x1="82" y1="88" x2="82" y2="112" />
              <line x1="118" y1="88" x2="118" y2="112" />
              <line x1="154" y1="88" x2="154" y2="112" />
              <line x1="190" y1="88" x2="190" y2="112" />
              <line x1="226" y1="88" x2="226" y2="112" />
              <line x1="258" y1="88" x2="258" y2="112" />
            </g>

            {/* Traditional slanted timber walls */}
            <path
              d="M36 62 L270 62 L262 90 L44 90 Z"
              fill={rumahBody}
            />
            {/* Carved upper frieze line */}
            <line x1="38" y1="68" x2="268" y2="68" stroke={rumahTrim} strokeWidth="1.5" opacity="0.7" />
            {/* Central entrance steps */}
            <path d="M144 88 L162 88 L166 112 L140 112 Z" fill={rumahRoof} opacity="0.8" />

            {/* Iconic 5-spire Sweeping Curved Atap Gonjong Roof */}
            <path
              d="
                M10 66
                C22 42, 34 26, 42 8
                C48 30, 62 44, 78 46
                C88 34, 96 20, 102 2
                C110 26, 128 38, 153 38
                C178 38, 196 26, 204 2
                C210 20, 218 34, 228 46
                C244 44, 258 30, 264 8
                C272 26, 284 42, 296 66
                Q224 58, 153 60
                Q82 58, 10 66 Z
              "
              fill={rumahRoof}
            />
            {/* Central crest spire */}
            <path
              d="M128 46 C140 34, 148 18, 153 -4 C158 18, 166 34, 178 46 Z"
              fill={rumahRoof}
            />
            {/* Subtle ridge trim highlight */}
            <path
              d="M22 63 Q86 55 153 57 Q220 55 284 63"
              fill="none"
              stroke={rumahTrim}
              strokeWidth="1.2"
              opacity="0.6"
            />

            {/* Traditional windows: warmly lit amber lanterns in Evening Edition */}
            <g
              ref={lanternsRef}
              data-testid="rumah-gadang-lanterns"
              opacity={isDark ? '0.5' : '0.28'}
            >
              {[62, 92, 122, 176, 206, 236].map((wx) => (
                <g key={wx}>
                  {isDark && (
                    <circle
                      cx={wx + 5}
                      cy={78}
                      r={10}
                      fill="#E8B96A"
                      opacity="0.22"
                    />
                  )}
                  <rect
                    x={wx}
                    y={72}
                    width={10}
                    height={12}
                    rx={1.5}
                    fill={isDark ? '#F3CA7A' : '#E7D5B8'}
                  />
                </g>
              ))}
            </g>

            {/* Companion Rangkiang (traditional granary) to the left */}
            <g transform="translate(-58, 36)" opacity="0.88">
              <line x1="14" y1="54" x2="14" y2="74" stroke={rumahBody} strokeWidth="1.8" />
              <line x1="34" y1="54" x2="34" y2="74" stroke={rumahBody} strokeWidth="1.8" />
              <path d="M10 36 L38 36 L35 55 L13 55 Z" fill={rumahBody} />
              <path
                d="M2 38 C8 24, 13 14, 17 4 C20 18, 28 18, 31 4 C35 14, 40 24, 46 38 Q24 33 2 38 Z"
                fill={rumahRoof}
              />
            </g>
          </g>

          {/* Secondary distant Rumah Gadang silhouette on left hillside for depth balance */}
          <g transform="translate(270, 152) scale(0.55)" opacity={isDark ? '0.52' : '0.32'}>
            <path d="M36 62 L270 62 L262 90 L44 90 Z" fill={rumahBody} />
            <path
              d="M10 66 C22 42, 34 26, 42 8 C48 30, 62 44, 78 46 C88 34, 96 20, 102 2 C110 26, 128 38, 153 38 C178 38, 196 26, 204 2 C210 20, 218 34, 228 46 C244 44, 258 30, 264 8 C272 26, 284 42, 296 66 Q153 58 10 66 Z"
              fill={rumahRoof}
            />
          </g>

          {/* Foreground rolling meadow */}
          <path
            d="M0 264 Q340 232 680 268 Q1040 238 1440 272 L1440 380 L0 380 Z"
            fill={hillFront}
          />

          {/* Winding Sungai Sirah river ribbon shimmering serenely across the valley */}
          <path
            d="M665 258 C610 276, 760 294, 650 326 C575 348, 495 360, 420 380 L555 380 C620 356, 725 338, 760 314 C802 286, 680 272, 704 256 Z"
            fill={riverFill}
            opacity="0.88"
          />
          <path
            d="M680 264 C640 278, 745 296, 668 322 C608 342, 540 356, 488 374"
            fill="none"
            stroke={riverHighlight}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* LAYER 4: Framing Botanical & Blossom Canopy (0.48x parallax + horizontal curtain part) */}
      <div
        ref={leftBranchRef}
        data-testid="backdrop-canopy-left"
        className="absolute -left-6 top-6 w-36 sm:w-52 md:w-72 lg:w-88 opacity-75 md:opacity-95 will-change-transform"
      >
        <div className="animate-breeze-left">
          <svg viewBox="0 0 320 460" className="h-auto w-full" fill="none">
            {/* Primary arching branch */}
            <path
              d="M-12 42 C68 62, 138 104, 198 168 C222 194, 248 214, 274 226"
              stroke={stemColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M-8 148 C56 164, 108 196, 152 252 C170 274, 186 296, 198 322"
              stroke={stemColor}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M84 92 C112 72, 146 62, 184 68"
              stroke={stemColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M118 212 C88 242, 68 278, 54 324"
              stroke={stemColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Painterly foliage leaves */}
            <g fill={leafDark} opacity="0.82">
              <ellipse cx="62" cy="68" rx="22" ry="9" transform="rotate(-24 62 68)" />
              <ellipse cx="122" cy="84" rx="26" ry="10" transform="rotate(-14 122 84)" />
              <ellipse cx="164" cy="144" rx="24" ry="9.5" transform="rotate(36 164 144)" />
              <ellipse cx="86" cy="186" rx="26" ry="10" transform="rotate(24 86 186)" />
              <ellipse cx="136" cy="242" rx="22" ry="9" transform="rotate(42 136 242)" />
              <ellipse cx="68" cy="284" rx="20" ry="8.5" transform="rotate(-48 68 284)" />
            </g>
            <g fill={leafSoft} opacity="0.72">
              <ellipse cx="94" cy="112" rx="20" ry="8" transform="rotate(32 94 112)" />
              <ellipse cx="182" cy="64" rx="22" ry="8.5" transform="rotate(-6 182 64)" />
              <ellipse cx="226" cy="196" rx="20" ry="8" transform="rotate(18 226 196)" />
              <ellipse cx="52" cy="162" rx="18" ry="7.5" transform="rotate(-18 52 162)" />
              <ellipse cx="172" cy="296" rx="21" ry="8" transform="rotate(52 172 296)" />
            </g>

            {/* Delicate Camellia / Champaca Blossoms */}
            {[
              { cx: 148, cy: 112, r: 16 },
              { cx: 214, cy: 174, r: 13 },
              { cx: 108, cy: 204, r: 15 },
              { cx: 186, cy: 274, r: 11 },
              { cx: 58, cy: 120, r: 12 },
            ].map((flower, i) => (
              <g key={i} transform={`translate(${flower.cx}, ${flower.cy})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx={0}
                    cy={-flower.r * 0.56}
                    rx={flower.r * 0.44}
                    ry={flower.r * 0.64}
                    fill={i % 2 === 0 ? petalMain : petalSoft}
                    opacity="0.88"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx={0} cy={0} r={flower.r * 0.25} fill={petalCenter} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div
        ref={rightBranchRef}
        data-testid="backdrop-canopy-right"
        className="absolute -right-6 top-6 w-36 sm:w-52 md:w-72 lg:w-88 opacity-75 md:opacity-95 will-change-transform"
      >
        <div className="animate-breeze-right">
          <svg viewBox="0 0 320 460" className="h-auto w-full -scale-x-100" fill="none">
            <path
              d="M-12 52 C68 74, 138 114, 198 178 C222 204, 248 224, 274 236"
              stroke={stemColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M-8 158 C56 174, 108 206, 152 262 C170 284, 186 306, 198 332"
              stroke={stemColor}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M84 102 C112 82, 146 72, 184 78"
              stroke={stemColor}
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <g fill={leafDark} opacity="0.82">
              <ellipse cx="62" cy="78" rx="22" ry="9" transform="rotate(-24 62 78)" />
              <ellipse cx="122" cy="94" rx="26" ry="10" transform="rotate(-14 122 94)" />
              <ellipse cx="164" cy="154" rx="24" ry="9.5" transform="rotate(36 164 154)" />
              <ellipse cx="86" cy="196" rx="26" ry="10" transform="rotate(24 86 196)" />
              <ellipse cx="136" cy="252" rx="22" ry="9" transform="rotate(42 136 252)" />
            </g>
            <g fill={leafSoft} opacity="0.72">
              <ellipse cx="94" cy="122" rx="20" ry="8" transform="rotate(32 94 122)" />
              <ellipse cx="182" cy="74" rx="22" ry="8.5" transform="rotate(-6 182 74)" />
              <ellipse cx="226" cy="206" rx="20" ry="8" transform="rotate(18 226 206)" />
              <ellipse cx="52" cy="172" rx="18" ry="7.5" transform="rotate(-18 52 172)" />
              <ellipse cx="172" cy="306" rx="21" ry="8" transform="rotate(52 172 306)" />
            </g>

            {[
              { cx: 152, cy: 122, r: 15 },
              { cx: 218, cy: 186, r: 13 },
              { cx: 112, cy: 214, r: 14 },
              { cx: 182, cy: 284, r: 11 },
              { cx: 64, cy: 130, r: 12 },
            ].map((flower, i) => (
              <g key={i} transform={`translate(${flower.cx}, ${flower.cy})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx={0}
                    cy={-flower.r * 0.56}
                    rx={flower.r * 0.44}
                    ry={flower.r * 0.64}
                    fill={i % 2 === 0 ? petalSoft : petalMain}
                    opacity="0.88"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx={0} cy={0} r={flower.r * 0.25} fill={petalCenter} />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* LAYER 5: Scroll-Reactive Living Atmosphere Canvas (Gliding birds + velocity-driven petals) */}
      <canvas
        ref={canvasRef}
        data-testid="living-atmosphere-canvas"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
