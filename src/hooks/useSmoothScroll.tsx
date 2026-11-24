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

interface SmoothScrollContextValue {
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  refreshScrollTriggers: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  scrollTo: () => {},
  refreshScrollTriggers: () => {},
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const refreshRafRef = useRef<number | null>(null);

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

    if (prefersReducedMotion) {
      return () => {
        isDisposed = true;
      };
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Keep GSAP ScrollTrigger positions synchronized with Lenis virtual scroll.
    const onLenisScroll = () => {
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
      // Also schedule an update shortly after scroll initiates so jumped sections reveal cleanly.
      window.setTimeout(finalizeVisibility, 420);
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
    <SmoothScrollContext.Provider value={{ scrollTo, refreshScrollTriggers }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}
