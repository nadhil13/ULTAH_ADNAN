import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export interface EditorialPhotoFrameProps {
  src: string;
  alt: string;
  mediaType?: 'image' | 'video';
  caption?: string;
  metaLabel?: string;
  subLabel?: string;
  aspectClass?: string;
  maxHeightClass?: string;
  parallaxAxis?: 'x' | 'y' | 'none';
  tiltDirection?: 1 | -1;
  isDefaultSlot?: boolean;
  defaultHint?: string;
  footerRight?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FRAME_SPRING = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 26,
  mass: 0.85,
};

export function EditorialPhotoFrame({
  src,
  alt,
  mediaType = 'image',
  caption,
  metaLabel,
  subLabel,
  aspectClass = 'aspect-[4/5]',
  maxHeightClass = '',
  parallaxAxis = 'none',
  tiltDirection = 1,
  isDefaultSlot = false,
  defaultHint,
  footerRight,
  onClick,
  ariaLabel,
}: EditorialPhotoFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Subtle vertical counter-parallax inside chapter plates when parallaxAxis === 'y'.
  useIsomorphicLayoutEffect(() => {
    if (parallaxAxis !== 'y') {
      return;
    }
    const frameEl = frameRef.current;
    const mediaEl = mediaRef.current;
    if (!frameEl || !mediaEl) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mediaEl,
        { scale: 1.09, yPercent: -4 },
        {
          scale: 1.09,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: frameEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.65,
          },
        }
      );
    }, frameRef);

    return () => {
      ctx.revert();
    };
  }, [parallaxAxis, src]);

  // Gently play muted video reels only while visible in viewport to save battery & CPU.
  useEffect(() => {
    if (mediaType !== 'video') {
      return;
    }
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      videoEl.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            videoEl.play().catch(() => {});
          } else {
            videoEl.pause();
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(videoEl);
    return () => {
      observer.disconnect();
      videoEl.pause();
    };
  }, [mediaType, src]);

  const innerContent = (
    <div
      ref={frameRef}
      className="paper-panel group relative rounded-[12px] border p-3 sm:p-4 transition-colors duration-200 hover:border-accent/65"
    >
      {metaLabel && (
        <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5 text-[11px] font-medium tracking-[0.02em] text-muted">
          <span>{metaLabel}</span>
          {mediaType === 'video' && (
            <span className="inline-flex items-center gap-1 text-accent">
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              <span>Rekaman</span>
            </span>
          )}
        </div>
      )}

      <div
        className={`relative w-full overflow-hidden rounded-[8px] bg-surface ${aspectClass} ${maxHeightClass}`}
      >
        {mediaType === 'video' ? (
          <video
            ref={(node) => {
              videoRef.current = node;
              mediaRef.current = node;
            }}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
            data-parallax-img={parallaxAxis === 'x' ? '' : undefined}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <img
            ref={(node) => {
              mediaRef.current = node;
            }}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            data-parallax-img={parallaxAxis === 'x' ? '' : undefined}
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}

        {mediaType === 'video' && (
          <div className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-border-hairline bg-canvas/90 px-3 py-1 text-[11px] font-medium text-ink">
            <Play className="h-3 w-3 fill-current text-accent" aria-hidden="true" />
            <span>Putar bersuara</span>
          </div>
        )}

        {isDefaultSlot && defaultHint && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-[6px] border border-border-hairline bg-canvas/90 px-2.5 py-1 text-[11px] text-muted">
            {defaultHint}
          </div>
        )}
      </div>

      {(caption || subLabel || footerRight) && (
        <div className="mt-3 space-y-1.5 px-0.5 text-left">
          {caption && (
            <p className="text-sm leading-relaxed text-ink line-clamp-2">{caption}</p>
          )}
          {(subLabel || footerRight) && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              {subLabel && <span className="min-w-0 leading-snug">{subLabel}</span>}
              {footerRight}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || caption || alt}
        whileHover={{ y: -4, rotate: tiltDirection * 0.35 }}
        whileTap={{ scale: 0.988 }}
        transition={FRAME_SPRING}
        className="block w-full text-left cursor-pointer rounded-[12px]"
      >
        {innerContent}
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3, rotate: tiltDirection * 0.25 }}
      transition={FRAME_SPRING}
      className="w-full"
    >
      {innerContent}
    </motion.div>
  );
}
