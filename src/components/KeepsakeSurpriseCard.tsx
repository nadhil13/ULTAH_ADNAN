import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Download, SlidersHorizontal } from 'lucide-react';
import type { BirthdayConfig } from '../data/birthdayConfig';
import { extractMonogram } from '../utils/birthdayMath';
import { downloadKeepsakeCardPng } from '../utils/keepsakeCard';

interface KeepsakeSurpriseCardProps {
  config: BirthdayConfig;
  wishText: string;
  isDark: boolean;
  onOpenPersonalize: () => void;
}

const REVEAL_SPRING = {
  type: 'spring' as const,
  stiffness: 195,
  damping: 24,
  mass: 0.9,
};

// Set to true whenever the user requests the Ubah Isi Kupon button to be shown again.
const SHOW_EDIT_COUPON_BUTTON = false;

export function KeepsakeSurpriseCard({
  config,
  wishText,
  isDark,
  onOpenPersonalize,
}: KeepsakeSurpriseCardProps) {
  const [downloaded, setDownloaded] = useState(false);
  const monogram = extractMonogram(config.senderName);

  const handleDownload = () => {
    const ok = downloadKeepsakeCardPng({
      celebrantName: config.celebrantName,
      turningAge: config.turningAge,
      senderName: config.senderName,
      surpriseTitle: config.surpriseTitle,
      surpriseSubtitle: config.surpriseSubtitle,
      surpriseNote: config.surpriseNote,
      wishText,
      isDark,
    });
    if (ok) {
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 3200);
    }
  };

  return (
    <motion.div
      data-testid="kejutan-terakhir-card"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={REVEAL_SPRING}
      className="mt-12 elevated-sheet rounded-[12px] border border-border-hairline bg-canvas p-6 sm:p-10"
    >
      <div className="rounded-[8px] border border-border-hairline bg-surface px-6 py-7 sm:px-9 sm:py-9">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border-hairline pb-4">
          <p className="text-xs font-medium text-accent">
            Kejutan Terakhir, Edisi Ulang Tahun
          </p>
          <p className="text-xs text-muted">
            Untuk {config.celebrantName}, usia {config.turningAge}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="min-w-0 lg:col-span-8">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium leading-snug text-ink max-w-[30ch]">
              {config.surpriseTitle}
            </h3>
            <p className="mt-2.5 text-sm font-medium text-muted">
              {config.surpriseSubtitle}
            </p>
            <p className="mt-4 max-w-[58ch] text-sm sm:text-base leading-relaxed text-ink">
              {config.surpriseNote}
            </p>

            {wishText.trim() && (
              <p className="mt-5 border-t border-border-hairline pt-4 font-serif italic text-sm sm:text-base text-muted">
                Harapan hari ini: "{wishText.trim()}"
              </p>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="lg:text-right">
                <p className="text-xs text-muted">Diterbitkan khusus oleh</p>
                <p className="font-serif text-lg font-medium text-ink">
                  {config.senderName}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink font-serif text-sm font-medium shrink-0"
              >
                {monogram}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={handleDownload}
                className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Kartu Tersimpan</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Simpan Kartu Kejutan</span>
                  </>
                )}
              </motion.button>

              {SHOW_EDIT_COUPON_BUTTON && (
                <button
                  type="button"
                  onClick={onOpenPersonalize}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-border-hairline bg-canvas px-3.5 py-2 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ubah Isi Kupon</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
