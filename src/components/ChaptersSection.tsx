import { motion } from 'motion/react';
import { CHAPTERS_DATA, type ChapterItem } from '../data/birthdayConfig';
import { ScrollRevealStage } from './ScrollRevealStage';
import { WordReveal } from './WordReveal';

const CARD_SPRING = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 26,
  mass: 0.85,
};

function ChapterCard({ chapter, index }: { chapter: ChapterItem; index: number }) {
  const isOdd = index % 2 === 1;

  if (chapter.layoutVariant === 'quote-highlight') {
    return (
      <ScrollRevealStage
        variant="clip"
        delay={0.04}
        className="md:col-span-10 md:col-start-2"
      >
        <motion.article
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.985 }}
          transition={CARD_SPRING}
          className="rounded-[12px] border border-border-hairline bg-surface px-7 py-10 sm:px-12 sm:py-12 transition-colors hover:border-accent/60"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border-hairline pb-4">
            <span className="font-serif text-3xl font-medium text-accent tabular-nums">
              {chapter.index}
            </span>
            <span className="text-sm text-muted">{chapter.period}</span>
          </div>

          <h3 className="mt-7 font-serif text-2xl sm:text-3xl font-medium leading-snug text-ink max-w-[34ch]">
            {chapter.title}
          </h3>

          <p className="mt-4 max-w-[64ch] text-base leading-relaxed text-muted">
            {chapter.summary}
          </p>

          <blockquote className="mt-8 border-t border-border-hairline pt-6 font-serif italic text-lg sm:text-xl text-ink max-w-[46ch]">
            "{chapter.note}"
          </blockquote>
        </motion.article>
      </ScrollRevealStage>
    );
  }

  if (chapter.layoutVariant === 'split-caption') {
    return (
      <ScrollRevealStage
        variant="lift"
        delay={0.04}
        className="md:col-span-9 md:col-start-4"
      >
        <motion.article
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.985 }}
          transition={CARD_SPRING}
          className="rounded-[12px] border border-border-hairline bg-canvas p-7 sm:p-9 transition-colors hover:border-accent/60"
        >
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
              <p className="mt-3.5 text-base leading-relaxed text-muted max-w-[58ch]">
                {chapter.summary}
              </p>
              <p className="mt-5 text-xs text-muted border-t border-border-hairline pt-4">
                {chapter.note}
              </p>
            </div>
          </div>
        </motion.article>
      </ScrollRevealStage>
    );
  }

  return (
    <ScrollRevealStage
      variant="lift"
      delay={0.04}
      className={isOdd ? 'md:col-span-8 md:col-start-5' : 'md:col-span-8 md:col-start-1'}
    >
      <motion.article
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        transition={CARD_SPRING}
        className="rounded-[12px] border border-border-hairline bg-canvas p-7 sm:p-10 transition-colors hover:border-accent/60"
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-serif text-4xl font-medium text-accent tabular-nums">
            {chapter.index}
          </span>
          <span className="text-sm text-muted">{chapter.period}</span>
        </div>

        <h3 className="mt-6 font-serif text-2xl sm:text-[1.75rem] font-medium leading-snug text-ink max-w-[30ch]">
          {chapter.title}
        </h3>

        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted">
          {chapter.summary}
        </p>

        <p className="mt-6 text-xs text-muted border-t border-border-hairline pt-4">
          {chapter.note}
        </p>
      </motion.article>
    </ScrollRevealStage>
  );
}

export function ChaptersSection() {
  return (
    <section
      id="babak"
      aria-labelledby="babak-heading"
      className="scroll-mt-20 border-t border-border-hairline py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end mb-14 sm:mb-20">
          <div className="lg:col-span-7 min-w-0">
            <p className="text-sm text-muted mb-3">Babak Perjalanan</p>
            <WordReveal
              id="babak-heading"
              as="h2"
              text="Empat jeda kecil dari perjalanan yang membentuk hari ini."
              className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.9rem,3.4vw,3rem)]"
            />
          </div>
          <ScrollRevealStage variant="lift" delay={0.08} className="lg:col-span-4 lg:col-start-9">
            <p className="text-sm leading-relaxed text-muted max-w-[44ch]">
              Disusun berurutan sebagai penanda fase, dari rasa ingin tahu pertama hingga halaman bersih di usia yang baru.
            </p>
          </ScrollRevealStage>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-y-12">
          {CHAPTERS_DATA.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
