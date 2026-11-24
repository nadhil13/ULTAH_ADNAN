import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import { ArrowDown, ImageIcon } from 'lucide-react';
import type { BirthdayConfig } from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import {
  calculateBirthdayStats,
  extractMonogram,
  resolveDisplayAge,
} from '../utils/birthdayMath';
import { WordReveal } from './WordReveal';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  config: BirthdayConfig;
  onOpenPersonalize: () => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function HeroSection({ config, onOpenPersonalize }: HeroSectionProps) {
  const { scrollTo } = useSmoothScroll();
  const [now, setNow] = useState<Date>(() => new Date());
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [isUnveiled, setIsUnveiled] = useState(false);

  const stageRef = useRef<HTMLElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const revealLayerRef = useRef<HTMLDivElement | null>(null);
  const portraitImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setPortraitFailed(false);
  }, [config.portraitUrl]);

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
        clipPath: 'inset(14% 16% 14% 16% round 10px)',
        opacity: 0,
      });

      if (portraitImgRef.current) {
        gsap.set(portraitImgRef.current, { scale: 1.12 });
      }

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
          opacity: 0.15,
          scale: 0.96,
          ease: 'power2.inOut',
          duration: 0.58,
        },
        0
      )
        .to(
          revealLayer,
          {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            opacity: 1,
            ease: 'power2.out',
            duration: 0.78,
          },
          0.16
        );

      if (portraitImgRef.current) {
        tl.to(
          portraitImgRef.current,
          {
            scale: 1,
            ease: 'none',
            duration: 0.9,
          },
          0.1
        );
      }
    });

    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      setIsUnveiled(true);
      gsap.set(cover, { clearProps: 'all' });
      gsap.fromTo(
        revealLayer,
        { opacity: 0, clipPath: 'inset(10% 0% 0% 0%)', y: 20 },
        {
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform,clipPath',
          scrollTrigger: {
            trigger: revealLayer,
            start: 'top 84%',
            once: true,
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
  const coverTitleText = `Monograf Ulang Tahun, ${config.celebrantName}.`;
  const greetingText = `Selamat ulang tahun yang ke ${displayAge}, ${config.celebrantName}.`;

  const handleOpenCover = () => {
    const isDesktop = window.innerWidth >= 768;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      {/* Layer 2 (Top at scrollY = 0): Serene Archival Opening Cover Curtain */}
      <div
        ref={coverRef}
        data-testid="opening-cover-curtain"
        className={`relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-canvas px-6 pt-16 text-center md:absolute md:inset-0 md:z-20 ${
          isUnveiled ? 'md:pointer-events-none' : 'md:pointer-events-auto'
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div
            aria-hidden="true"
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-border-hairline bg-surface font-serif text-lg font-medium tracking-wider text-accent"
          >
            {monogram}
          </div>

          <p className="text-sm text-muted mb-4">
            Edisi khusus, {stats.formattedBirthdate}
          </p>

          <WordReveal
            as="h1"
            text={coverTitleText}
            immediate
            className="font-serif font-medium tracking-[-0.025em] text-ink leading-[1.08] text-[clamp(2.5rem,5.2vw,4.6rem)]"
          />

          <p className="mt-6 max-w-[44ch] text-sm sm:text-base leading-relaxed text-muted">
            Lembaran kenangan, catatan perjalanan, dan doa yang disusun tenang untuk hari ulang tahunmu.
          </p>

          <button
            type="button"
            onClick={handleOpenCover}
            className="group mt-14 inline-flex min-h-11 flex-col items-center gap-3 text-xs font-medium text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <span>Gulir perlahan untuk membuka</span>
            <span className="flex h-10 w-px bg-border-hairline group-hover:bg-accent transition-colors" />
            <ArrowDown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Layer 1 (Underneath): Unveiled Editorial Monograph Hero Spread */}
      <div
        ref={revealLayerRef}
        id="pembuka-monograf"
        data-testid="hero-unveiled-spread"
        className={`relative w-full bg-canvas md:absolute md:inset-0 md:z-10 md:flex md:items-center md:pt-16 ${
          isUnveiled ? 'md:pointer-events-auto' : 'md:pointer-events-none'
        }`}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
            <div className="min-w-0 lg:col-span-7 flex flex-col justify-center">
              <p className="text-sm text-muted mb-4">
                Monograf ulang tahun, {stats.formattedBirthdate}
              </p>

              <h2 className="font-serif font-medium tracking-[-0.025em] text-ink leading-[1.08] text-[clamp(2.15rem,4.2vw,3.8rem)]">
                {greetingText}
              </h2>

              <p className="mt-5 max-w-[58ch] text-base sm:text-lg leading-relaxed text-muted">
                {config.heroOpeningLine}
              </p>

              <div className="mt-8 border-t border-b border-border-hairline py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <p className="text-sm font-medium text-ink">
                    Waktu yang telah dijalani
                  </p>
                  <p className="text-xs text-muted tabular-nums">
                    {stats.isValid
                      ? stats.isBirthdayToday
                        ? 'Hari ini adalah hari ulang tahunmu'
                        : `Menuju usia ${stats.upcomingAge}: ${stats.daysUntilNextBirthday} hari, ${stats.hoursUntilNextBirthday} jam, ${stats.minutesUntilNextBirthday} menit lagi`
                      : 'Atur tanggal lahir di Ubah Data'}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Tahun</dt>
                    <dd className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.yearsLived : '0'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Hari berjalan</dt>
                    <dd className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.daysSinceLastBirthday : '0'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Jam</dt>
                    <dd className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.hoursRemainder : '0'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Menit</dt>
                    <dd className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                      {stats.isValid ? stats.minutesRemainder : '0'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  onClick={() => scrollTo('#dedikasi', 0)}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-[8px] bg-accent px-6 py-3 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Baca Lembaran Pertama</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>
            </div>

            <figure className="min-w-0 lg:col-span-5">
              <div className="group overflow-hidden rounded-[6px] border border-border-hairline bg-surface">
                <div className="aspect-[3/4] max-h-[60dvh] w-full overflow-hidden bg-surface">
                  {!portraitFailed && config.portraitUrl ? (
                    <img
                      ref={portraitImgRef}
                      src={config.portraitUrl}
                      alt={`Potret edisi ulang tahun untuk ${config.celebrantName}`}
                      referrerPolicy="no-referrer"
                      onError={() => setPortraitFailed(true)}
                      className="h-full w-full object-cover will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                      <ImageIcon className="h-8 w-8 text-muted mb-3" aria-hidden="true" />
                      <p className="font-serif text-lg text-ink">Bingkai Potret Arsip</p>
                      <p className="mt-1 text-xs text-muted max-w-[26ch]">
                        Pilih foto lokal dari perangkatmu melalui menu Ubah Data.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span className="max-w-[38ch] leading-relaxed">{config.portraitCaption}</span>
                <button
                  type="button"
                  onClick={onOpenPersonalize}
                  className="text-accent underline underline-offset-4 hover:opacity-80 whitespace-nowrap shrink-0 cursor-pointer py-1"
                >
                  Ganti foto di Ubah Data
                </button>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
