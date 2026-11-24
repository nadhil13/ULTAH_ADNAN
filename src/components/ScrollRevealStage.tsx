import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealStageProps {
  children: ReactNode;
  variant?: 'clip' | 'lift';
  delay?: number;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollRevealStage({
  children,
  variant = 'lift',
  delay = 0,
  className = '',
}: ScrollRevealStageProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, clipPath: 'none', clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      if (variant === 'clip') {
        gsap.fromTo(
          el,
          { opacity: 0, clipPath: 'inset(10% 0% 0% 0%)', y: 20 },
          {
            opacity: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            duration: 0.85,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'bottom 10%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.78,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, wrapperRef);

    return () => {
      ctx.revert();
    };
  }, [variant, delay]);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}
