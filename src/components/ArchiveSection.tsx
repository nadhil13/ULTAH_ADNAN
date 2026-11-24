import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ImageIcon, Plus, Trash2, X } from 'lucide-react';
import {
  ARCHIVE_CATEGORIES,
  type ArchiveCategory,
  type ArchivePhoto,
} from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { WordReveal } from './WordReveal';

gsap.registerPlugin(ScrollTrigger);

interface ArchiveSectionProps {
  photos: ArchivePhoto[];
  onAddLocalPhoto: (file: File, category: Exclude<ArchiveCategory, 'Semua'>) => void;
  onRemovePhoto: (id: string) => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 210,
  damping: 26,
  mass: 0.85,
};

function getDesktopFrameWidth(aspect: ArchivePhoto['aspect']): string {
  switch (aspect) {
    case '16/10':
      return 'lg:w-[44vw] lg:max-w-[580px]';
    case '4/3':
      return 'lg:w-[39vw] lg:max-w-[510px]';
    case '1/1':
      return 'lg:w-[32vw] lg:max-w-[420px]';
    case '4/5':
    default:
      return 'lg:w-[27vw] lg:max-w-[360px]';
  }
}

function getMobileSpan(aspect: ArchivePhoto['aspect']): string {
  if (aspect === '16/10' || aspect === '4/3') {
    return 'md:col-span-7';
  }
  return 'md:col-span-5';
}

function getAspectClass(aspect: ArchivePhoto['aspect']): string {
  switch (aspect) {
    case '16/10':
      return 'aspect-[16/10]';
    case '4/5':
      return 'aspect-[4/5]';
    case '1/1':
      return 'aspect-square';
    case '4/3':
    default:
      return 'aspect-[4/3]';
  }
}

function formatCounterIndex(value: number): string {
  return String(value).padStart(2, '0');
}

export function ArchiveSection({
  photos,
  onAddLocalPhoto,
  onRemovePhoto,
}: ArchiveSectionProps) {
  const { refreshScrollTriggers } = useSmoothScroll();
  const [activeCategory, setActiveCategory] = useState<ArchiveCategory>('Semua');
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [focusedIndex, setFocusedIndex] = useState(1);

  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'Semua') {
      return photos;
    }
    return photos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory, photos]);

  const activeLightboxIndex = useMemo(() => {
    if (!lightboxId) {
      return -1;
    }
    return filteredPhotos.findIndex((item) => item.id === lightboxId);
  }, [filteredPhotos, lightboxId]);

  const activePhoto =
    activeLightboxIndex >= 0 ? filteredPhotos[activeLightboxIndex] : null;

  useEffect(() => {
    setFocusedIndex(1);
  }, [activeCategory, filteredPhotos.length]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track || filteredPhotos.length <= 1) {
      refreshScrollTriggers();
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const getTravelDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth + 64);

      if (getTravelDistance() <= 24) {
        return;
      }

      const parallaxImgs = track.querySelectorAll<HTMLElement>('[data-parallax-img]');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(520, getTravelDistance() * 1.08)}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const total = filteredPhotos.length;
            const nextFocused = Math.min(
              total,
              Math.max(1, Math.round(self.progress * (total - 1)) + 1)
            );
            setFocusedIndex(nextFocused);
          },
        },
      });

      tl.to(
        track,
        {
          x: () => -getTravelDistance(),
          ease: 'none',
          duration: 1,
        },
        0
      );

      if (parallaxImgs.length > 0) {
        tl.fromTo(
          parallaxImgs,
          { scale: 1.14, xPercent: -5 },
          { scale: 1.14, xPercent: 5, ease: 'none', duration: 1 },
          0
        );
      }
    });

    mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = track.querySelectorAll<HTMLElement>('[data-archive-frame]');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: card,
              start: 'top 86%',
              once: true,
            },
          }
        );
      });
    });

    refreshScrollTriggers();

    return () => {
      mm.revert();
    };
  }, [activeCategory, filteredPhotos.length, refreshScrollTriggers]);

  useEffect(() => {
    if (!activePhoto) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxId(null);
      } else if (event.key === 'ArrowRight' && filteredPhotos.length > 1) {
        const nextIdx = (activeLightboxIndex + 1) % filteredPhotos.length;
        setLightboxId(filteredPhotos[nextIdx].id);
      } else if (event.key === 'ArrowLeft' && filteredPhotos.length > 1) {
        const prevIdx =
          (activeLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        setLightboxId(filteredPhotos[prevIdx].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLightboxIndex, activePhoto, filteredPhotos]);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const targetCategory: Exclude<ArchiveCategory, 'Semua'> =
      activeCategory === 'Semua' ? 'Bersama' : activeCategory;
    onAddLocalPhoto(file, targetCategory);
    event.target.value = '';
  };

  const handlePrev = () => {
    if (filteredPhotos.length <= 1 || activeLightboxIndex < 0) {
      return;
    }
    const prevIdx = (activeLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxId(filteredPhotos[prevIdx].id);
  };

  const handleNext = () => {
    if (filteredPhotos.length <= 1 || activeLightboxIndex < 0) {
      return;
    }
    const nextIdx = (activeLightboxIndex + 1) % filteredPhotos.length;
    setLightboxId(filteredPhotos[nextIdx].id);
  };

  return (
    <section
      ref={sectionRef}
      id="arsip"
      aria-labelledby="arsip-heading"
      className="scroll-mt-20 relative border-t border-border-hairline bg-canvas py-24 sm:py-28 lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div className="min-w-0 max-w-2xl">
            <p className="text-sm text-muted mb-2.5">Arsip Kenangan</p>
            <WordReveal
              id="arsip-heading"
              as="h2"
              text="Potongan visual yang layak disimpan lebih lama."
              className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.85rem,3.2vw,2.75rem)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {filteredPhotos.length > 0 && (
              <p
                data-testid="archive-rail-counter"
                className="hidden lg:block font-serif text-lg text-ink tabular-nums"
                aria-live="polite"
              >
                <span className="text-accent">{formatCounterIndex(focusedIndex)}</span>
                <span className="mx-1.5 text-muted">/</span>
                <span className="text-muted">{formatCounterIndex(filteredPhotos.length)}</span>
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="sr-only"
              aria-label="Unggah foto lokal ke arsip"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={triggerFilePicker}
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-border-hairline bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah Foto Lokal</span>
            </motion.button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Filter kategori arsip foto"
          className="mb-8 flex flex-wrap items-center gap-2"
        >
          {ARCHIVE_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            const count =
              category === 'Semua'
                ? photos.length
                : photos.filter((item) => item.category === category).length;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`relative min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-accent text-accent-ink'
                    : 'border border-border-hairline bg-canvas text-muted hover:text-ink hover:border-ink/40'
                }`}
              >
                <span>{category}</span>
                <span className="ml-1.5 text-xs opacity-80 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <motion.div
            key="empty-archive"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="rounded-[12px] border border-border-hairline bg-surface px-6 py-14 text-center sm:px-12"
          >
            <ImageIcon className="mx-auto h-7 w-7 text-muted mb-4" aria-hidden="true" />
            <h3 className="font-serif text-2xl font-medium text-ink">
              Belum ada foto pada kategori {activeCategory}
            </h3>
            <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-relaxed text-muted">
              Ruang ini sengaja dibiarkan bersih agar kamu dapat menambahkan dokumentasi pribadi dari perangkatmu sendiri selama sesi ini.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity whitespace-nowrap cursor-pointer"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Tambah Foto Lokal ke {activeCategory}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('Semua')}
                className="inline-flex min-h-11 items-center rounded-[8px] border border-border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap cursor-pointer"
              >
                Tampilkan Semua Foto
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="mx-auto w-full max-w-6xl overflow-hidden px-5 sm:px-8"
        >
          <div
            ref={trackRef}
            data-testid="archive-rail-track"
            className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start lg:flex lg:w-max lg:flex-nowrap lg:items-center lg:gap-10 lg:pr-12 will-change-transform"
          >
            {filteredPhotos.map((photo, idx) => (
              <figure
                key={photo.id}
                data-archive-frame
                className={`min-w-0 lg:shrink-0 ${getMobileSpan(photo.aspect)} ${getDesktopFrameWidth(photo.aspect)}`}
              >
                <motion.button
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.985 }}
                  transition={SPRING_TRANSITION}
                  onClick={() => setLightboxId(photo.id)}
                  aria-label={`Buka pratinjau penuh: ${photo.caption}`}
                  className="group block w-full text-left focus-visible:rounded-[6px] cursor-pointer"
                >
                  <div
                    className={`overflow-hidden rounded-[6px] border border-border-hairline bg-surface transition-colors group-hover:border-accent/70 lg:max-h-[46dvh] ${getAspectClass(
                      photo.aspect
                    )}`}
                  >
                    {!brokenImages[photo.id] ? (
                      <img
                        data-parallax-img
                        src={photo.src}
                        alt={photo.alt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [photo.id]: true }))
                        }
                        className="h-full w-full object-cover lg:scale-[1.1] will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.13]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                        <ImageIcon className="h-7 w-7 text-muted mb-2" aria-hidden="true" />
                        <span className="text-xs text-muted">{photo.dateLabel}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 flex items-baseline justify-between gap-4">
                    <p className="text-sm leading-relaxed text-ink max-w-[46ch]">
                      {photo.caption}
                    </p>
                    <span className="text-xs text-muted tabular-nums whitespace-nowrap shrink-0">
                      {formatCounterIndex(idx + 1)} / {photo.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{photo.dateLabel}</p>
                </motion.button>
              </figure>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Pratinjau foto: ${activePhoto.caption}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.14 }}
            onClick={() => setLightboxId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.985, transition: { duration: 0.14 } }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="elevated-sheet relative w-full max-w-4xl overflow-hidden rounded-[12px] border border-border-hairline bg-canvas"
            >
              <div className="flex items-center justify-between gap-4 border-b border-border-hairline px-5 py-3.5 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {activePhoto.dateLabel}
                  </p>
                  <p className="text-xs text-muted tabular-nums">
                    Foto {activeLightboxIndex + 1} dari {filteredPhotos.length}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activePhoto.isUserUploaded && (
                    <button
                      type="button"
                      onClick={() => {
                        onRemovePhoto(activePhoto.id);
                        setLightboxId(null);
                      }}
                      aria-label="Hapus foto lokal ini"
                      className="inline-flex h-11 items-center gap-1.5 rounded-[8px] border border-border-hairline px-3 text-xs font-medium text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setLightboxId(null)}
                    aria-label="Tutup pratinjau foto"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-border-hairline text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="relative flex max-h-[65dvh] items-center justify-center bg-surface p-4 sm:p-6">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  referrerPolicy="no-referrer"
                  className="max-h-[58dvh] w-auto max-w-full rounded-[6px] object-contain"
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm leading-relaxed text-ink max-w-[60ch]">
                  {activePhoto.caption}
                </p>

                {filteredPhotos.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Foto sebelumnya"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-border-hairline px-3.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Foto berikutnya"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-border-hairline px-3.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                      <span>Berikutnya</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
