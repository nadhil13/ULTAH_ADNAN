import { useEffect, useRef } from 'react';

interface FoilParticlesCanvasProps {
  triggerKey: number;
  isDark: boolean;
}

interface FoilParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  swayPhase: number;
  swaySpeed: number;
  color: string;
  opacity: number;
}

export function FoilParticlesCanvas({ triggerKey, isDark }: FoilParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (triggerKey <= 0) {
      return;
    }

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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Muted gold, silk linen, and claret/rose foil palette matching our monograph theme.
    const palette = isDark
      ? ['#E6A0B2', '#C9B18A', '#D7C4A5', '#A5AEB8', '#F2F3EE']
      : ['#7D223C', '#B6935E', '#A8566C', '#D4C2A3', '#4A545E'];

    const originX = width * 0.5;
    const originY = height * 0.42;

    const particles: FoilParticle[] = Array.from({ length: 44 }, (_, index) => {
      const isRibbon = index % 3 === 0;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 2.4 + Math.random() * 4.4;
      return {
        x: originX + (Math.random() - 0.5) * 180,
        y: originY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        width: isRibbon ? 14 + Math.random() * 10 : 5 + Math.random() * 5,
        height: isRibbon ? 2.6 : 4 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.14,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.04 + Math.random() * 0.04,
        color: palette[index % palette.length],
        opacity: 0.85,
      };
    });

    const durationMs = 2500;
    const startTime = performance.now();
    let rafId = 0;

    const renderFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      ctx.clearRect(0, 0, width, height);

      const fade = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;

      for (const p of particles) {
        p.swayPhase += p.swaySpeed;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.095;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.45;
        p.y += p.vy;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity * fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }

      if (progress < 1) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [triggerKey, isDark]);

  if (triggerKey <= 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
