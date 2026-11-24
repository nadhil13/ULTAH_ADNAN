import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquareText, Send, Trash2 } from 'lucide-react';
import type { WishEntry } from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import {
  hasValidationErrors,
  validateWishInput,
  type WishValidationErrors,
} from '../utils/validation';
import { ScrollRevealStage } from './ScrollRevealStage';
import { WordReveal } from './WordReveal';

interface WishWallSectionProps {
  wishes: WishEntry[];
  celebrantName: string;
  onAddWish: (entry: Omit<WishEntry, 'id' | 'createdAt'>) => void;
  onDeleteWish: (id: string) => void;
}

const CARD_SPRING = {
  type: 'spring' as const,
  stiffness: 210,
  damping: 26,
  mass: 0.85,
};

function formatWishDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Baru saja';
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function WishWallSection({
  wishes,
  celebrantName,
  onAddWish,
  onDeleteWish,
}: WishWallSectionProps) {
  const { refreshScrollTriggers } = useSmoothScroll();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<WishValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationNote, setConfirmationNote] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshScrollTriggers();
    }, 220);
    return () => window.clearTimeout(timer);
  }, [wishes.length, refreshScrollTriggers]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmationNote(null);

    const nextErrors = validateWishInput({ name, relation, message });
    setErrors(nextErrors);
    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      onAddWish({
        name: name.trim(),
        relation: relation.trim() || 'Kerabat',
        message: message.trim(),
      });
      setName('');
      setRelation('');
      setMessage('');
      setErrors({});
      setIsSubmitting(false);
      setConfirmationNote('Ucapan berhasil dicatat ke dalam buku tamu.');
    }, 320);
  };

  const focusWishForm = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section
      id="ucapan"
      aria-labelledby="ucapan-heading"
      className="scroll-mt-20 relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="paper-panel rounded-[12px] border p-6 sm:p-8 mb-10">
          <p className="text-sm text-muted mb-2.5">Buku Ucapan</p>
          <WordReveal
            id="ucapan-heading"
            as="h2"
            text={`Tinggalkan pesan hangat untuk ${celebrantName}.`}
            className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.85rem,3.3vw,2.85rem)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          <ScrollRevealStage variant="lift" className="min-w-0 lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="paper-panel-tinted rounded-[12px] border p-6 sm:p-8"
            >
              <h3 className="font-serif text-xl font-medium text-ink">
                Tulis Ucapan Baru
              </h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Ucapan akan tersimpan langsung di peramban perangkat ini.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="wish-name"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Nama pengirim
                  </label>
                  <input
                    ref={nameInputRef}
                    id="wish-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'wish-name-error' : undefined}
                    placeholder="Nama lengkap atau panggilan"
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                  />
                  {errors.name && (
                    <p
                      id="wish-name-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-accent"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="wish-relation"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Hubungan (opsional)
                  </label>
                  <input
                    id="wish-relation"
                    name="relation"
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    placeholder="Contoh: Sahabat, Keluarga, Rekan kuliah"
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wish-message"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Ucapan dan doa
                  </label>
                  <textarea
                    id="wish-message"
                    name="message"
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) {
                        setErrors((prev) => ({ ...prev, message: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'wish-message-error' : undefined}
                    placeholder="Tuliskan doa atau kenangan singkat yang ingin kamu sampaikan..."
                    className="w-full rounded-[8px] border border-border-hairline bg-canvas px-3.5 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted/70 focus:border-accent"
                  />
                  {errors.message && (
                    <p
                      id="wish-message-error"
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-accent"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.985 }}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-accent px-5 py-3 text-sm font-medium text-accent-ink hover:opacity-92 disabled:opacity-65 transition-opacity cursor-pointer"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{isSubmitting ? 'Menyimpan ucapan...' : 'Kirim Ucapan'}</span>
                </motion.button>

                {confirmationNote && (
                  <p role="status" className="text-xs font-medium text-ink">
                    {confirmationNote}
                  </p>
                )}
              </div>
            </form>
          </ScrollRevealStage>

          <ScrollRevealStage variant="lift" delay={0.08} className="min-w-0 lg:col-span-7">
            <div className="paper-panel mb-5 flex items-baseline justify-between gap-4 rounded-[10px] border px-5 py-3.5">
              <h3 className="font-serif text-xl font-medium text-ink">
                Catatan yang Tersimpan
              </h3>
              <span className="text-xs text-muted tabular-nums">
                {wishes.length} ucapan
              </span>
            </div>

            {wishes.length === 0 ? (
              <div className="paper-panel rounded-[12px] border px-7 py-14 text-center">
                <MessageSquareText
                  className="mx-auto h-7 w-7 text-muted mb-4"
                  aria-hidden="true"
                />
                <h4 className="font-serif text-2xl font-medium text-ink">
                  Belum ada ucapan yang tercatat
                </h4>
                <p className="mx-auto mt-3 max-w-[48ch] text-sm leading-relaxed text-muted">
                  Halaman buku tamu ini masih kosong tanpa pesan buatan. Jadilah orang pertama yang menuliskan doa atau kenangan untuk {celebrantName}.
                </p>
                <button
                  type="button"
                  onClick={focusWishForm}
                  className="mt-7 inline-flex min-h-11 items-center rounded-[8px] border border-border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                >
                  Tulis Ucapan Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {wishes.map((wish) => (
                    <motion.article
                      key={wish.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={CARD_SPRING}
                      whileHover={{ y: -3 }}
                      className="paper-panel rounded-[12px] border p-6 transition-colors hover:border-accent/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-serif text-lg font-medium text-ink">
                            {wish.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-muted">
                            {wish.relation}, {formatWishDate(wish.createdAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteWish(wish.id)}
                          aria-label={`Hapus ucapan dari ${wish.name}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-muted hover:bg-surface hover:text-accent transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <p className="mt-4 max-w-[64ch] text-sm sm:text-base leading-relaxed text-ink whitespace-pre-line">
                        {wish.message}
                      </p>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollRevealStage>
        </div>
      </div>
    </section>
  );
}
