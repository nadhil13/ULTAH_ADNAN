import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FoldVertical, MailOpen } from 'lucide-react';
import type { BirthdayConfig } from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { extractMonogram } from '../utils/birthdayMath';
import { ScrollRevealStage } from './ScrollRevealStage';
import { WordReveal } from './WordReveal';

interface LetterSectionProps {
  config: BirthdayConfig;
}

type EnvelopeStage = 'sealed' | 'opening' | 'open';

const SHEET_SPRING = {
  type: 'spring' as const,
  stiffness: 190,
  damping: 25,
  mass: 0.9,
};

export function LetterSection({ config }: LetterSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { refreshScrollTriggers } = useSmoothScroll();
  const [stage, setStage] = useState<EnvelopeStage>('sealed');
  const openTimerRef = useRef<number | null>(null);

  const monogram = extractMonogram(config.senderName);
  const resolvedSalutation = config.letterSalutation.replace(
    '[NAMA PENERIMA]',
    config.celebrantName
  );

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stage === 'opening') {
      return;
    }
    const timer = window.setTimeout(() => {
      refreshScrollTriggers();
    }, 260);
    return () => window.clearTimeout(timer);
  }, [stage, refreshScrollTriggers]);

  const handleOpenLetter = () => {
    if (stage !== 'sealed') {
      return;
    }
    if (prefersReducedMotion) {
      setStage('open');
      return;
    }
    setStage('opening');
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setStage('open');
    }, 260);
  };

  const handleCloseLetter = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    setStage('sealed');
  };

  const isOpening = stage === 'opening';
  const isOpen = stage === 'open';

  return (
    <section
      id="surat"
      aria-labelledby="surat-heading"
      className="editorial-scrim scroll-mt-20 relative border-t border-border-hairline py-24 sm:py-32"
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm text-muted mb-3">Surat Tersegel</p>
          <WordReveal
            id="surat-heading"
            as="h2"
            text="Sepucuk surat yang dilipat rapi untuk dibaca pelan."
            className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.9rem,3.4vw,3rem)]"
          />
        </div>

        <ScrollRevealStage variant="clip">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="sealed-envelope"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.985, transition: { duration: 0.14 } }}
                transition={SHEET_SPRING}
                style={{ perspective: 900 }}
                className="relative overflow-hidden rounded-[12px] border border-border-hairline bg-surface px-6 py-12 sm:px-12 sm:py-16"
              >
                {/* Peeking archival letter paper sheet rising subtly as the flap lifts */}
                <motion.div
                  aria-hidden="true"
                  initial={false}
                  animate={
                    isOpening
                      ? { y: -18, opacity: 1 }
                      : { y: 14, opacity: 0 }
                  }
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="pointer-events-none absolute inset-x-8 top-6 h-20 rounded-t-[8px] border border-border-hairline bg-canvas"
                />

                {/* Top triangular envelope flap that lifts open during stage === 'opening' */}
                <motion.svg
                  aria-hidden="true"
                  viewBox="0 0 800 180"
                  preserveAspectRatio="none"
                  initial={false}
                  animate={
                    isOpening
                      ? { rotateX: -145, opacity: 0.35 }
                      : { rotateX: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.26, ease: 'easeOut' }}
                  style={{ transformOrigin: '50% 0%' }}
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full text-border-hairline"
                >
                  <path
                    d="M0 0 L400 150 L800 0"
                    fill="var(--surface)"
                    fillOpacity="0.88"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </motion.svg>

                <div className="relative z-10 flex flex-col items-center text-center pt-10">
                  <p className="text-xs text-muted mb-2">Tertuju kepada</p>
                  <p className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                    {config.celebrantName}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Dari {config.senderName}
                  </p>

                  <motion.button
                    type="button"
                    whileHover={isOpening ? undefined : { y: -3, scale: 1.02 }}
                    whileTap={isOpening ? undefined : { scale: 0.97 }}
                    transition={SHEET_SPRING}
                    onClick={handleOpenLetter}
                    disabled={isOpening}
                    aria-expanded={false}
                    className="mt-9 inline-flex flex-col items-center gap-3 cursor-pointer group disabled:cursor-default"
                  >
                    <motion.span
                      animate={
                        isOpening
                          ? { scale: 1.28, opacity: 0, rotate: 12 }
                          : { scale: 1, opacity: 1, rotate: 0 }
                      }
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-ink font-serif text-xl font-medium tracking-wider transition-transform duration-200 group-hover:scale-105"
                    >
                      {monogram}
                    </motion.span>
                    <span className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-ink group-hover:border-accent group-hover:text-accent transition-colors">
                      <MailOpen className="h-4 w-4" aria-hidden="true" />
                      <span>{isOpening ? 'Membuka segel...' : 'Buka Surat'}</span>
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.article
                key="opened-letter"
                data-testid="opened-letter-sheet"
                initial={{ opacity: 0, y: 36, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.985, transition: { duration: 0.14 } }}
                transition={SHEET_SPRING}
                className="elevated-sheet rounded-[12px] border border-border-hairline bg-canvas px-7 py-10 sm:px-14 sm:py-14"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-hairline pb-6">
                  <div>
                    <p className="font-serif text-xl sm:text-2xl font-medium text-ink">
                      {resolvedSalutation}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Catatan ulang tahun pribadi
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseLetter}
                    aria-expanded={true}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <FoldVertical className="h-4 w-4" aria-hidden="true" />
                    <span>Lipat Kembali</span>
                  </button>
                </div>

                <div className="mt-8 space-y-6 max-w-[64ch] text-base leading-[1.82] text-ink">
                  {config.letterBody.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === 0
                          ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-5xl first-letter:font-medium first-letter:leading-none first-letter:text-accent'
                          : ''
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-12 flex flex-col gap-5 border-t border-border-hairline pt-7 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm text-muted">{config.letterClosing}</p>
                    <p className="mt-1.5 font-serif text-2xl font-medium text-ink">
                      {config.senderName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseLetter}
                    className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Lipat Kembali
                  </button>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </ScrollRevealStage>
      </div>
    </section>
  );
}
