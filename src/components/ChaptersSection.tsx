import { motion } from 'motion/react';
import { CHAPTERS_DATA, type ChapterItem } from '../data/birthdayConfig';
import { EditorialPhotoFrame } from './EditorialPhotoFrame';
import { ScrollRevealStage } from './ScrollRevealStage';
import { WordReveal } from './WordReveal';

const CARD_SPRING = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 26,
  mass: 0.85,
};

function ChapterRow({ chapter, index }: { chapter: ChapterItem; index: number }) {
  const isOdd = index % 2 === 1;
  const isQuoteHighlight = chapter.layoutVariant === 'quote-highlight';
  const isSplitCaption = chapter.layoutVariant === 'split-caption';

  const narrativeCard = (
    <ScrollRevealStage
      variant={isQuoteHighlight ? 'clip' : 'lift'}
      delay={0.04}
      className={isOdd ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7 lg:order-1'}
    >
      <motion.article
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        transition={CARD_SPRING}
        className={`rounded-[12px] border p-7 sm:p-10 transition-colors hover:border-accent/60 ${isQuoteHighlight ? 'paper-panel-tinted' : 'paper-panel'
          }`}
      >
        {isSplitCaption ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start">
            <div className="sm:col-span-4">
              <span className="block font-serif text-4xl font-medium text-accent tabular-nums">
                {chapter.index}
              </span>
              <p className="mt-2 text-sm font-medium text-muted">{chapter.period}</p>
            </div>
            <div className="sm:col-span-8 min-w-0">
              <h3 className="font-serif text-2xl font-medium leading-snug text-ink">
                {chapter.title}
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-muted max-w-[56ch]">
                {chapter.summary}
              </p>
              <p className="mt-5 text-xs text-muted border-t border-border-hairline pt-4">
                {chapter.note}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border-hairline pb-4">
              <span className="font-serif text-3xl sm:text-4xl font-medium text-accent tabular-nums">
                {chapter.index}
              </span>
              <span className="text-sm text-muted">{chapter.period}</span>
            </div>

            <h3 className="mt-6 font-serif text-2xl sm:text-[1.8rem] font-medium leading-snug text-ink max-w-[32ch]">
              {chapter.title}
            </h3>

            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted">
              {chapter.summary}
            </p>

            {isQuoteHighlight ? (
              <blockquote className="mt-7 border-t border-border-hairline pt-5 font-serif italic text-lg sm:text-xl text-ink max-w-[44ch]">
                "{chapter.note}"
              </blockquote>
            ) : (
              <p className="mt-6 text-xs text-muted border-t border-border-hairline pt-4">
                {chapter.note}
              </p>
            )}
          </>
        )}
      </motion.article>
    </ScrollRevealStage>
  );

  const visualPlate = (
    <div className={isOdd ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5 lg:order-2'}>
      <EditorialPhotoFrame
        src={chapter.plateSrc}
        alt={chapter.plateAlt}
        subLabel={chapter.plateCaption}
        aspectClass="aspect-[4/5]"
        parallaxAxis="y"
        tiltDirection={isOdd ? -1 : 1}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center lg:gap-10">
      {narrativeCard}
      {visualPlate}
    </div>
  );
}

export function ChaptersSection() {
  return (
    <section
      id="babak"
      aria-labelledby="babak-heading"
      className="scroll-mt-20 relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="paper-panel rounded-[12px] border p-6 sm:p-9 mb-12 sm:mb-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7 min-w-0">
              <p className="text-sm text-muted mb-2.5">Babak Perjalanan</p>
              <WordReveal
                id="babak-heading"
                as="h2"
                text="Empat jeda kecil dari Sungai Sirah menuju usia dua puluh dua."
                className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.85rem,3.3vw,2.9rem)]"
              />
            </div>
            <ScrollRevealStage
              variant="lift"
              delay={0.08}
              className="lg:col-span-4 lg:col-start-9"
            >
              <p className="text-sm leading-relaxed text-muted max-w-[44ch]">
                Disusun berurutan sebagai penanda fase, dari halaman rumah yang hangat hingga ruang baru di usia 22 tahun.
              </p>
            </ScrollRevealStage>
          </div>
        </div>

        <div className="space-y-12 sm:space-y-18">
          {CHAPTERS_DATA.map((chapter, index) => (
            <ChapterRow key={chapter.id} chapter={chapter} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
