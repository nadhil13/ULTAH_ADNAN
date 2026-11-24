import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollMetrics {
  velocity: number;
  progress: number;
  scrollY: number;
}

interface SmoothScrollContextValue {
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  refreshScrollTriggers: () => void;
  getScrollMetrics: () => ScrollMetrics;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  scrollTo: () => {},
  refreshScrollTriggers: () => {},
  getScrollMetrics: () => ({ velocity: 0, progress: 0, scrollY: 0 }),
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const refreshRafRef = useRef<number | null>(null);
  const metricsRef = useRef<ScrollMetrics>({ velocity: 0, progress: 0, scrollY: 0 });
  const lastNativeScrollRef = useRef<{ y: number; t: number }>({ y: 0, t: 0 });

  const refreshScrollTriggers = useCallback(() => {
    if (refreshRafRef.current !== null) {
      window.cancelAnimationFrame(refreshRafRef.current);
    }
    refreshRafRef.current = window.requestAnimationFrame(() => {
      refreshRafRef.current = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        refreshRafRef.current = null;
      });
    });
  }, []);

  const getScrollMetrics = useCallback((): ScrollMetrics => {
    const lenis = lenisRef.current;
    if (lenis) {
      const docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      return {
        velocity: lenis.velocity || 0,
        progress: Math.max(0, Math.min(1, window.scrollY / docHeight)),
        scrollY: window.scrollY,
      };
    }
    return metricsRef.current;
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isDisposed = false;

    const handleFontsReady = () => {
      if (!isDisposed) {
        ScrollTrigger.refresh();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(handleFontsReady).catch(() => {});
    }

    const onNativeScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const dt = Math.max(16, now - lastNativeScrollRef.current.t);
      const dy = y - lastNativeScrollRef.current.y;
      lastNativeScrollRef.current = { y, t: now };
      metricsRef.current = {
        velocity: (dy / dt) * 16,
        progress: Math.max(0, Math.min(1, y / docHeight)),
        scrollY: y,
      };
    };

    if (prefersReducedMotion) {
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      return () => {
        isDisposed = true;
        window.removeEventListener('scroll', onNativeScroll);
      };
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    const onLenisScroll = () => {
      const docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      metricsRef.current = {
        velocity: lenis.velocity || 0,
        progress: Math.max(0, Math.min(1, window.scrollY / docHeight)),
        scrollY: window.scrollY,
      };
      ScrollTrigger.update();
    };
    lenis.on('scroll', onLenisScroll);

    const onGsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onGsapTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      isDisposed = true;
      if (refreshRafRef.current !== null) {
        window.cancelAnimationFrame(refreshRafRef.current);
      }
      gsap.ticker.remove(onGsapTick);
      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string | number | HTMLElement, offset = -72) => {
    const lenis = lenisRef.current;

    const finalizeVisibility = () => {
      ScrollTrigger.update();
    };

    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        onComplete: finalizeVisibility,
      });
      window.setTimeout(finalizeVisibility, 420);
      window.setTimeout(finalizeVisibility, 820);
      return;
    }

    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'auto' });
      finalizeVisibility();
      return;
    }

    const element =
      typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      finalizeVisibility();
    }
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{ scrollTo, refreshScrollTriggers, getScrollMetrics }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}
