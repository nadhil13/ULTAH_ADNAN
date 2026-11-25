import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import type { BirthdayConfig } from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import {
  calculateBirthdayStats,
  extractMonogram,
  resolveDisplayAge,
} from '../utils/birthdayMath';
import { EditorialPhotoFrame } from './EditorialPhotoFrame';
import { WordReveal } from './WordReveal';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  config: BirthdayConfig;
  onOpenPersonalize: () => void;
  onStartAudio?: () => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function HeroSection({
  config,
  onOpenPersonalize,
  onStartAudio,
}: HeroSectionProps) {
  const { scrollTo } = useSmoothScroll();
  const [now, setNow] = useState<Date>(() => new Date());
  const [isUnveiled, setIsUnveiled] = useState(false);

  const stageRef = useRef<HTMLElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const revealLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    const cover = coverRef.current;
    const revealLayer = revealLayerRef.current;
    if (!stage || !cover || !revealLayer) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      setIsUnveiled(false);

      gsap.set(cover, {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        scale: 1,
      });

      gsap.set(revealLayer, {
        clipPath: 'inset(12% 10% 12% 10% round 12px)',
        opacity: 0,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=130%',
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setIsUnveiled(self.progress >= 0.48);
          },
        },
      });

      tl.to(
        cover,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          opacity: 0.1,
          scale: 0.96,
          ease: 'power2.inOut',
          duration: 0.58,
        },
        0
      ).to(
        revealLayer,
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          opacity: 1,
          ease: 'power2.out',
          duration: 0.78,
        },
        0.16
      );
    });

    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      setIsUnveiled(true);
      gsap.set(cover, { clearProps: 'all' });
      gsap.fromTo(
        revealLayer,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: revealLayer,
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      setIsUnveiled(true);
      gsap.set([cover, revealLayer], { clearProps: 'all', opacity: 1 });
    });

    return () => {
      mm.revert();
    };
  }, [config.celebrantName, config.portraitUrl]);

  const stats = calculateBirthdayStats(config.birthdate, now);
  const displayAge = resolveDisplayAge(config.turningAge, stats);
  const monogram = extractMonogram(config.celebrantName);
  const birthStamp = config.birthplace
    ? `${config.birthplace}, ${stats.formattedBirthdate}`
    : stats.formattedBirthdate;
  const greetingText = `Selamat ulang tahun yang ke ${displayAge}, ${config.celebrantName}.`;

  // Synchronous user-gesture trigger: starts Ari Lasso - Cinta Terakhir AND scrolls cleanly.
  const handleOpenCover = () => {
    onStartAudio?.();
    const isDesktop = window.innerWidth >= 768;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (isDesktop && !prefersReduced) {
      scrollTo(Math.round(window.innerHeight * 1.28), 0);
      return;
    }
    const spreadEl = document.getElementById('pembuka-monograf');
    if (spreadEl) {
      scrollTo(spreadEl, -64);
    }
  };

  return (
    <section
      ref={stageRef}
      id="beranda"
      aria-label="Sampul dan Pembuka Monograf"
      className="relative w-full md:h-[100dvh] md:overflow-hidden"
    >
      {/* Layer 2 (Top at scrollY = 0): Opening Cover positioned cleanly above the Rumah Gadang roofline */}
      <div
        ref={coverRef}
        data-testid="opening-cover-curtain"
        className={`relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-5 pt-22 pb-34 sm:px-8 sm:pb-40 text-center md:absolute md:inset-0 md:z-20 ${isUnveiled ? 'md:pointer-events-none' : 'md:pointer-events-auto'
          }`}
      >
        {/* Soft upper-sky clarity scrim guaranteeing >7:1 WCAG AA+ text contrast across the cover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--canvas) 90%, transparent) 0%, color-mix(in srgb, var(--canvas) 62%, transparent) 42%, transparent 74%)',
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
          <div
            aria-hidden="true"
            className="paper-panel mb-5 flex h-14 w-14 items-center justify-center rounded-full border font-serif text-base font-medium tracking-wider text-accent"
          >
            {monogram}
          </div>

          <p className="text-xs sm:text-sm font-medium tracking-[0.03em] text-muted mb-2.5">
            {config.coverHeaderLine}
          </p>

          <WordReveal
            as="h1"
            text={config.celebrantName}
            immediate
            className="font-serif font-medium tracking-[-0.025em] text-ink leading-[1.06] text-[clamp(2.45rem,5.5vw,4.75rem)]"
          />

          <p className="mt-3.5 text-sm sm:text-base font-medium text-accent">
            {birthStamp}
          </p>

          <div className="mt-8 sm:mt-9 flex flex-col items-center gap-3.5">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={handleOpenCover}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-accent px-8 py-3 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Buka Lembaran
            </motion.button>

            {/* Soft-scrim caption pill seated well above the Rumah Gadang gonjong spires */}
            <span className="cover-caption-pill inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium text-muted">
              Gulir perlahan untuk menyibak cerita
            </span>
          </div>
        </div>
      </div>

      {/* Layer 1 (Underneath): Unveiled Editorial Monograph Hero Spread */}
      <div
        ref={revealLayerRef}
        id="pembuka-monograf"
        data-testid="hero-unveiled-spread"
        className={`relative w-full md:absolute md:inset-0 md:z-10 md:flex md:items-center md:pt-16 ${isUnveiled ? 'md:pointer-events-auto' : 'md:pointer-events-none'
          }`}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="paper-panel min-w-0 lg:col-span-7 flex flex-col justify-center rounded-[12px] border p-6 sm:p-9">
              <p className="text-sm text-muted mb-3">
                Monograf ulang tahun, {birthStamp}
              </p>

              <h2 className="font-serif font-medium tracking-[-0.025em] text-ink leading-[1.08] text-[clamp(2rem,3.9vw,3.45rem)]">
                {greetingText}
              </h2>

              <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-muted">
                {config.heroOpeningLine}
              </p>

              <div className="mt-7 border-t border-b border-border-hairline py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
                  <p className="text-sm font-medium text-ink">
                    Waktu yang telah dijalani
                  </p>
                  <p className="text-xs text-muted tabular-nums">
                    {stats.isValid
                      ? stats.isBirthdayToday
                        ? 'Hari ini adalah hari ulang tahunmu'
                        : `Menuju usia ${stats.upcomingAge}: ${stats.daysUntilNextBirthday} hari, ${stats.hoursUntilNextBirthday} jam, ${stats.minutesUntilNextBirthday} menit lagi`
                      : 'Tanggal lahir belum diatur'}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-4">
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Tahun</dt>
                    <dd className="mt-0.5 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.yearsLived : '0'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Hari berjalan</dt>
                    <dd className="mt-0.5 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.daysSinceLastBirthday : '0'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Jam</dt>
                    <dd className="mt-0.5 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.hoursRemainder : '0'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Menit</dt>
                    <dd className="mt-0.5 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.minutesRemainder : '0'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  onClick={() => scrollTo('#dedikasi', 0)}
                  className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-accent px-6 py-3 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Baca Lembaran Pertama
                </motion.button>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-5">
              <EditorialPhotoFrame
                src={config.portraitUrl}
                alt={`Potret edisi ulang tahun untuk ${config.celebrantName}`}
                subLabel={config.portraitCaption}
                aspectClass="aspect-[3/4]"
                maxHeightClass="max-h-[56dvh]"
                parallaxAxis="none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
