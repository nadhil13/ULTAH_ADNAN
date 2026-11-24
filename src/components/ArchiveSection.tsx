import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Film,
  ImageIcon,
  X,
} from 'lucide-react';
import {
  ARCHIVE_CATEGORIES,
  type ArchiveCategory,
  type ArchivePhoto,
} from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { EditorialPhotoFrame } from './EditorialPhotoFrame';
import { WordReveal } from './WordReveal';

gsap.registerPlugin(ScrollTrigger);

interface ArchiveSectionProps {
  photos: ArchivePhoto[];
  onSetAudioDucking?: (ducked: boolean) => void;
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
      return 'lg:w-[40vw] lg:max-w-[540px]';
    case '4/3':
      return 'lg:w-[35vw] lg:max-w-[460px]';
    case '9/16':
      return 'lg:w-[22vw] lg:max-w-[290px]';
    case '1/1':
      return 'lg:w-[28vw] lg:max-w-[370px]';
    case '4/5':
    default:
      return 'lg:w-[26vw] lg:max-w-[340px]';
  }
}

function getMobileSpan(aspect: ArchivePhoto['aspect']): string {
  if (aspect === '16/10' || aspect === '4/3') {
    return 'sm:col-span-6';
  }
  return 'sm:col-span-6';
}

function getAspectClass(aspect: ArchivePhoto['aspect']): string {
  switch (aspect) {
    case '16/10':
      return 'aspect-[16/10]';
    case '9/16':
      return 'aspect-[9/16]';
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
  onSetAudioDucking,
}: ArchiveSectionProps) {
  const { refreshScrollTriggers } = useSmoothScroll();
  const [activeCategory, setActiveCategory] = useState<ArchiveCategory>('Semua');
  const [showAllContactSheet, setShowAllContactSheet] = useState(false);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(1);
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : true
  );

  const pinStageRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktopViewport(event.matches);
    };
    setIsDesktopViewport(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // All items matching current category tab (used by Lightbox Prev/Next so all 42 items are navigable).
  const categoryItems = useMemo(() => {
    if (activeCategory === 'Semua') {
      return photos;
    }
    return photos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory, photos]);

  // Curated horizontal showcase rail items: keeps the pinned desktop horizontal glide crisp & balanced.
  const railPhotos = useMemo(() => {
    if (activeCategory === 'Semua') {
      const featuredImages = photos.filter(
        (item) => item.featured && item.mediaType !== 'video'
      );
      return featuredImages.length > 0 ? featuredImages : photos.slice(0, 10);
    }
    return categoryItems.slice(0, 12);
  }, [activeCategory, categoryItems, photos]);

  const videoReels = useMemo(
    () => photos.filter((item) => item.mediaType === 'video'),
    [photos]
  );

  // Remaining archival photographs shown in the editorial contact-sheet grid below the pinned rail.
  const contactSheetPhotos = useMemo(() => {
    if (activeCategory === 'Rekaman') {
      return [];
    }
    if (activeCategory === 'Semua') {
      return photos.filter((item) => !item.featured && item.mediaType !== 'video');
    }
    return categoryItems.slice(12);
  }, [activeCategory, categoryItems, photos]);

  const visibleContactSheet = useMemo(
    () => (showAllContactSheet ? contactSheetPhotos : contactSheetPhotos.slice(0, 8)),
    [contactSheetPhotos, showAllContactSheet]
  );

  const activeLightboxIndex = useMemo(() => {
    if (!lightboxId) {
      return -1;
    }
    return categoryItems.findIndex((item) => item.id === lightboxId);
  }, [categoryItems, lightboxId]);

  const activePhoto =
    activeLightboxIndex >= 0 ? categoryItems[activeLightboxIndex] : null;

  // Duck background music softly while watching a video with sound in the Lightbox.
  useEffect(() => {
    const isWatchingVideo = Boolean(activePhoto && activePhoto.mediaType === 'video');
    onSetAudioDucking?.(isWatchingVideo);
    return () => {
      onSetAudioDucking?.(false);
    };
  }, [activePhoto, onSetAudioDucking]);

  useEffect(() => {
    setFocusedIndex(1);
    setShowAllContactSheet(false);
  }, [activeCategory]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshScrollTriggers();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [showAllContactSheet, activeCategory, photos.length, refreshScrollTriggers]);

  useIsomorphicLayoutEffect(() => {
    const stage = pinStageRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!stage || !viewport || !track || railPhotos.length <= 1) {
      refreshScrollTriggers();
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const getTravelDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth + 48);

      if (getTravelDistance() <= 24) {
        return;
      }

      const parallaxImgs = track.querySelectorAll<HTMLElement>('[data-parallax-img]');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${Math.max(480, getTravelDistance() * 1.02)}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const total = railPhotos.length;
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
          { scale: 1.12, xPercent: -4 },
          { scale: 1.12, xPercent: 4, ease: 'none', duration: 1 },
          0
        );
      }
    });

    refreshScrollTriggers();

    return () => {
      mm.revert();
    };
  }, [activeCategory, railPhotos.length, refreshScrollTriggers]);

  useEffect(() => {
    if (!activePhoto) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxId(null);
      } else if (event.key === 'ArrowRight' && categoryItems.length > 1) {
        const nextIdx = (activeLightboxIndex + 1) % categoryItems.length;
        setLightboxId(categoryItems[nextIdx].id);
      } else if (event.key === 'ArrowLeft' && categoryItems.length > 1) {
        const prevIdx =
          (activeLightboxIndex - 1 + categoryItems.length) % categoryItems.length;
        setLightboxId(categoryItems[prevIdx].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLightboxIndex, activePhoto, categoryItems]);

  const handlePrev = () => {
    if (categoryItems.length <= 1 || activeLightboxIndex < 0) {
      return;
    }
    const prevIdx =
      (activeLightboxIndex - 1 + categoryItems.length) % categoryItems.length;
    setLightboxId(categoryItems[prevIdx].id);
  };

  const handleNext = () => {
    if (categoryItems.length <= 1 || activeLightboxIndex < 0) {
      return;
    }
    const nextIdx = (activeLightboxIndex + 1) % categoryItems.length;
    setLightboxId(categoryItems[nextIdx].id);
  };

  return (
    <section
      id="arsip"
      aria-labelledby="arsip-heading"
      className="scroll-mt-20 relative py-20 sm:py-26"
    >
      {/* Part A: Pinned Horizontal Showcase Stage */}
      <div
        ref={pinStageRef}
        className="lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-center lg:py-16"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="paper-panel rounded-[12px] border p-5 sm:p-7 mb-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-2xl">
                <p className="text-sm text-muted mb-2">Arsip Kenangan</p>
                <WordReveal
                  id="arsip-heading"
                  as="h2"
                  text="Potongan visual dan tawa nyata yang layak disimpan lama."
                  className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.75rem,3vw,2.65rem)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                {railPhotos.length > 0 && (
                  <p
                    data-testid="archive-rail-counter"
                    className="hidden lg:block font-serif text-lg text-ink tabular-nums"
                    aria-live="polite"
                  >
                    <span className="text-accent">
                      {formatCounterIndex(focusedIndex)}
                    </span>
                    <span className="mx-1.5 text-muted">/</span>
                    <span className="text-muted">
                      {formatCounterIndex(railPhotos.length)}
                    </span>
                  </p>
                )}

              </div>
            </div>

            <div
              role="tablist"
              aria-label="Filter kategori arsip kenangan"
              className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-hairline pt-4"
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
                    <span className="ml-1.5 text-xs opacity-85 tabular-nums">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {categoryItems.length === 0 ? (
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <motion.div
              key="empty-archive"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="paper-panel-tinted rounded-[12px] border px-6 py-14 text-center sm:px-12"
            >
              <ImageIcon className="mx-auto h-7 w-7 text-muted mb-4" aria-hidden="true" />
              <h3 className="font-serif text-2xl font-medium text-ink">
                Belum ada kenangan pada kategori {activeCategory}
              </h3>
              <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-relaxed text-muted">
                Pilih kategori lain untuk melihat kenangan yang tersimpan.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory('Semua')}
                  className="inline-flex min-h-11 items-center rounded-[8px] border border-border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap cursor-pointer"
                >
                  Tampilkan Semua Arsip
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
              className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start lg:flex lg:w-max lg:flex-nowrap lg:items-center lg:gap-8 lg:pr-12 will-change-transform"
            >
              {railPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  data-archive-frame
                  className={`min-w-0 lg:shrink-0 ${getMobileSpan(photo.aspect)} ${getDesktopFrameWidth(photo.aspect)}`}
                >
                  <EditorialPhotoFrame
                    src={photo.src}
                    alt={photo.alt}
                    mediaType={photo.mediaType}
                    caption={photo.caption}
                    metaLabel={`${formatCounterIndex(idx + 1)} / ${photo.category}`}
                    subLabel={photo.dateLabel}
                    aspectClass={getAspectClass(photo.aspect)}
                    maxHeightClass="lg:max-h-[44dvh]"
                    parallaxAxis={isDesktopViewport ? 'x' : 'none'}
                    tiltDirection={idx % 2 === 0 ? 1 : -1}
                    onClick={() => setLightboxId(photo.id)}
                    ariaLabel={`Buka pratinjau penuh: ${photo.caption}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Part B: Dedicated 9:16 Vertical Motion Reels Filmstrip (All 4 Videos from /img) */}
      {activeCategory === 'Semua' && videoReels.length > 0 && (
        <div className="mx-auto mt-16 sm:mt-20 w-full max-w-6xl px-5 sm:px-8">
          <div className="paper-panel rounded-[12px] border p-5 sm:p-7 mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-accent mb-1.5">
                <Film className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Rekaman Bergerak</span>
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Empat potongan cerita yang bergerak hidup.
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted max-w-[40ch]">
              Ketuk salah satu bingkai video untuk memutar pratinjau penuh lengkap dengan suaranya.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videoReels.map((reel, idx) => (
              <EditorialPhotoFrame
                key={reel.id}
                src={reel.src}
                alt={reel.alt}
                mediaType="video"
                caption={reel.caption}
                metaLabel={`Rekaman 0${idx + 1}`}
                subLabel={reel.dateLabel}
                aspectClass="aspect-[9/16]"
                tiltDirection={idx % 2 === 0 ? 1 : -1}
                onClick={() => setLightboxId(reel.id)}
                ariaLabel={`Putar video penuh: ${reel.caption}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Part C: Complete Archival Contact Sheet (All Remaining Real Photos from /img) */}
      {contactSheetPhotos.length > 0 && (
        <div className="mx-auto mt-16 sm:mt-20 w-full max-w-6xl px-5 sm:px-8">
          <div className="paper-panel rounded-[12px] border p-5 sm:p-7 mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted mb-1">
                Lembar Kontak Koleksi
              </p>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
                Album lengkap perjalanan dan kebersamaan ({contactSheetPhotos.length} lembar foto tambahan)
              </h3>
            </div>

            {contactSheetPhotos.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllContactSheet((prev) => !prev)}
                aria-expanded={showAllContactSheet}
                className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-border-hairline bg-surface px-4 py-2.5 text-xs sm:text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {showAllContactSheet
                  ? 'Ringkas Lembar Kontak'
                  : `Buka Seluruh ${contactSheetPhotos.length} Lembar Foto`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visibleContactSheet.map((photo, idx) => (
              <EditorialPhotoFrame
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                mediaType={photo.mediaType}
                caption={photo.caption}
                metaLabel={photo.category}
                aspectClass="aspect-[4/5]"
                tiltDirection={idx % 2 === 0 ? 1 : -1}
                onClick={() => setLightboxId(photo.id)}
                ariaLabel={`Buka pratinjau penuh: ${photo.caption}`}
              />
            ))}
          </div>

          {!showAllContactSheet && contactSheetPhotos.length > 8 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllContactSheet(true)}
                className="paper-panel inline-flex min-h-12 items-center justify-center rounded-[8px] border px-6 py-3 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                Tampilkan {contactSheetPhotos.length - 8} Foto Lainnya
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full-Screen Photo & Video Lightbox */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Pratinjau kenangan: ${activePhoto.caption}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.14 }}
            onClick={() => setLightboxId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8"
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
                    Kenangan {activeLightboxIndex + 1} dari {categoryItems.length}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLightboxId(null)}
                    aria-label="Tutup pratinjau"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-border-hairline text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="relative flex max-h-[66dvh] items-center justify-center bg-surface p-4 sm:p-6">
                {activePhoto.mediaType === 'video' ? (
                  <video
                    key={activePhoto.src}
                    src={activePhoto.src}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[58dvh] w-auto max-w-full rounded-[6px] object-contain"
                  />
                ) : (
                  <img
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    referrerPolicy="no-referrer"
                    className="max-h-[58dvh] w-auto max-w-full rounded-[6px] object-contain"
                  />
                )}
              </div>

              <div className="flex flex-col gap-4 border-t border-border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm leading-relaxed text-ink max-w-[60ch]">
                  {activePhoto.caption}
                </p>

                {categoryItems.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Kenangan sebelumnya"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-border-hairline px-3.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Kenangan berikutnya"
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
