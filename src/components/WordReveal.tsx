import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface WordRevealProps {
  id?: string;
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote';
  mode?: 'reveal' | 'scrub';
  immediate?: boolean;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function WordReveal({
  id,
  text,
  as: Tag = 'h2',
  mode = 'reveal',
  immediate = false,
  className = '',
}: WordRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const words = text.trim().split(/\s+/).filter(Boolean);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wordEls = container.querySelectorAll<HTMLElement>('[data-word-inner]');
    if (wordEls.length === 0) {
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(wordEls, { yPercent: 0, opacity: 1, clearProps: 'transform,opacity' });
      return;
    }

    const ctx = gsap.context(() => {
      if (mode === 'scrub') {
        gsap.fromTo(
          wordEls,
          { opacity: 0.24 },
          {
            opacity: 1,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top 84%',
              end: 'bottom 42%',
              scrub: 0.6,
            },
          }
        );
        return;
      }

      if (immediate) {
        gsap.fromTo(
          wordEls,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.035,
            duration: 0.75,
            ease: 'power3.out',
            clearProps: 'transform',
          }
        );
        return;
      }

      gsap.fromTo(
        wordEls,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.032,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, container);

    let active = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => {
          if (active) {
            ScrollTrigger.refresh();
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
      ctx.revert();
    };
  }, [text, mode, immediate]);

  return (
    <div ref={containerRef} className="min-w-0">
      <Tag id={id} aria-label={text} className={className}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            aria-hidden="true"
            className={
              mode === 'scrub'
                ? 'inline-block mr-[0.26em] last:mr-0'
                : 'inline-block overflow-hidden align-bottom mr-[0.26em] last:mr-0 pb-[0.06em]'
            }
          >
            <span data-word-inner className="inline-block will-change-transform">
              {word}
            </span>
          </span>
        ))}
      </Tag>
    </div>
  );
}
