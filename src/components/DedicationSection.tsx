import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface DedicationSectionProps {
  dedicationParagraph: string;
  dedicationClosingPhrase: string;
  senderName: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function DedicationSection({
  dedicationParagraph,
  dedicationClosingPhrase,
  senderName,
}: DedicationSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRuleRef = useRef<HTMLDivElement | null>(null);
  const signatureRef = useRef<HTMLParagraphElement | null>(null);

  const mainWords = dedicationParagraph.trim().split(/\s+/).filter(Boolean);
  const closingWords = dedicationClosingPhrase.trim().split(/\s+/).filter(Boolean);
  const fullAccessibleText = `${dedicationParagraph.trim()} ${dedicationClosingPhrase.trim()}`;

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const allWordEls = section.querySelectorAll<HTMLElement>('[data-dedication-word]');
    const closingWordEls = section.querySelectorAll<HTMLElement>('[data-dedication-closing]');
    const progressEl = progressRuleRef.current;
    const signatureEl = signatureRef.current;

    if (allWordEls.length === 0) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set(allWordEls, { opacity: 0.12 });
      if (progressEl) {
        gsap.set(progressEl, { scaleX: 0 });
      }
      if (signatureEl) {
        gsap.set(signatureEl, { opacity: 0, y: 12 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=160%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(
        allWordEls,
        {
          opacity: 1,
          stagger: 0.04,
          duration: 0.35,
          ease: 'none',
        },
        0
      );

      if (progressEl) {
        tl.to(
          progressEl,
          {
            scaleX: 1,
            ease: 'none',
            duration: tl.duration(),
          },
          0
        );
      }

      // Transition only the closing phrase into the Burgundy Claret / Rose Silk accent.
      if (closingWordEls.length > 0) {
        tl.to(
          closingWordEls,
          {
            color: 'var(--accent)',
            stagger: 0.015,
            duration: 0.3,
            ease: 'power1.out',
          },
          '>-0.12'
        );
      }

      if (signatureEl) {
        tl.to(
          signatureEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: 'power2.out',
          },
          '<+0.05'
        );
      }
    });

    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.set(allWordEls, { opacity: 0.16 });
      if (progressEl) {
        gsap.set(progressEl, { scaleX: 0 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          end: 'bottom 45%',
          scrub: 0.6,
        },
      });

      tl.to(
        allWordEls,
        {
          opacity: 1,
          stagger: 0.04,
          duration: 0.3,
          ease: 'none',
        },
        0
      );

      if (progressEl) {
        tl.to(progressEl, { scaleX: 1, ease: 'none', duration: tl.duration() }, 0);
      }

      if (closingWordEls.length > 0) {
        tl.to(
          closingWordEls,
          {
            color: 'var(--accent)',
            duration: 0.25,
            ease: 'none',
          },
          '>-0.08'
        );
      }
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(allWordEls, { opacity: 1 });
      gsap.set(closingWordEls, { color: 'var(--accent)' });
      if (progressEl) {
        gsap.set(progressEl, { scaleX: 1 });
      }
      if (signatureEl) {
        gsap.set(signatureEl, { opacity: 1, y: 0 });
      }
    });

    return () => {
      mm.revert();
    };
  }, [dedicationParagraph, dedicationClosingPhrase]);

  return (
    <section
      ref={sectionRef}
      id="dedikasi"
      aria-labelledby="dedikasi-heading"
      className="editorial-scrim scroll-mt-20 relative border-t border-border-hairline py-24 sm:py-28 md:flex md:min-h-[100dvh] md:flex-col md:justify-center md:py-20"
    >
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <h2
          id="dedikasi-heading"
          className="text-sm font-sans font-medium text-muted mb-8 sm:mb-10"
        >
          Dedikasi
        </h2>

        <p
          aria-label={fullAccessibleText}
          className="font-serif font-normal text-ink leading-[1.36] tracking-[-0.015em] text-[clamp(1.5rem,3vw,2.5rem)] max-w-[38ch]"
        >
          {mainWords.map((word, index) => (
            <span
              key={`main-${index}`}
              aria-hidden="true"
              data-dedication-word
              className="inline-block mr-[0.26em]"
            >
              {word}
            </span>
          ))}
          {closingWords.map((word, index) => (
            <span
              key={`closing-${index}`}
              aria-hidden="true"
              data-dedication-word
              data-dedication-closing
              className="inline-block mr-[0.26em] last:mr-0"
            >
              {word}
            </span>
          ))}
        </p>

        <p ref={signatureRef} className="mt-10 text-sm text-muted">
          Disusun khusus oleh {senderName}
        </p>

        <div className="mt-12 h-px w-full bg-border-hairline overflow-hidden" aria-hidden="true">
          <div
            ref={progressRuleRef}
            className="h-full w-full origin-left bg-accent will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}
