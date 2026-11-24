import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Flame, RotateCcw, Wind } from 'lucide-react';
import type { BirthdayConfig } from '../data/birthdayConfig';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { FoilParticlesCanvas } from './FoilParticlesCanvas';
import { KeepsakeSurpriseCard } from './KeepsakeSurpriseCard';
import { ScrollRevealStage } from './ScrollRevealStage';
import { WordReveal } from './WordReveal';

interface CandleSectionProps {
  config: BirthdayConfig;
  isDark: boolean;
  onOpenPersonalize: () => void;
}

export function CandleSection({
  config,
  isDark,
  onOpenPersonalize,
}: CandleSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { refreshScrollTriggers } = useSmoothScroll();
  const [isLit, setIsLit] = useState(true);
  const [surpriseUnlocked, setSurpriseUnlocked] = useState(false);
  const [foilTriggerKey, setFoilTriggerKey] = useState(0);
  const [wishText, setWishText] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const blownViaHoldRef = useRef(false);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!surpriseUnlocked) {
      return;
    }
    const timer = window.setTimeout(() => {
      refreshScrollTriggers();
    }, 280);
    return () => window.clearTimeout(timer);
  }, [surpriseUnlocked, refreshScrollTriggers]);

  const extinguishCandle = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setIsLit(false);
    setSurpriseUnlocked(true);
    setFoilTriggerKey((prev) => prev + 1);
  };

  const handlePointerDown = () => {
    if (!isLit) {
      return;
    }
    blownViaHoldRef.current = false;
    setIsHolding(true);
    holdTimerRef.current = window.setTimeout(() => {
      blownViaHoldRef.current = true;
      extinguishCandle();
    }, 800);
  };

  const handlePointerCancelOrLeave = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  const handleClickBlow = () => {
    if (!isLit) {
      return;
    }
    if (blownViaHoldRef.current) {
      blownViaHoldRef.current = false;
      return;
    }
    extinguishCandle();
  };

  const handleRelight = () => {
    setIsLit(true);
    setIsHolding(false);
  };

  return (
    <section
      id="lilin"
      aria-labelledby="lilin-heading"
      className="twilight-stage scroll-mt-20 relative py-22 sm:py-30 text-ink"
    >
      <FoilParticlesCanvas triggerKey={foilTriggerKey} isDark={true} />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          <ScrollRevealStage variant="lift" className="min-w-0 lg:col-span-6">
            <div className="paper-panel rounded-[12px] border p-7 sm:p-10">
              <p className="text-sm text-muted mb-2.5">Ritual Lilin Senja</p>
              <WordReveal
                id="lilin-heading"
                as="h2"
                text="Simpan satu harapan kecil sebelum meniup lilinnya."
                className="font-serif font-medium tracking-[-0.02em] text-ink leading-[1.14] text-[clamp(1.85rem,3.3vw,2.85rem)]"
              />

              <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-muted">
                Tuliskan harapan pribadi jika ingin (hanya tersimpan di layar ini dan tidak dikirim ke mana pun), lalu klik atau tahan tombol di bawah untuk memadamkan api.
              </p>

              <div className="mt-7 max-w-md">
                <label
                  htmlFor="private-wish-input"
                  className="block text-sm font-medium text-ink mb-2"
                >
                  Harapan pribadi (opsional)
                </label>
                <input
                  id="private-wish-input"
                  type="text"
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Contoh: selalu diberi ketenangan dan kesehatan"
                  maxLength={140}
                  className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted/75 focus:border-accent"
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isLit ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerCancelOrLeave}
                    onPointerLeave={handlePointerCancelOrLeave}
                    onPointerCancel={handlePointerCancelOrLeave}
                    onClick={handleClickBlow}
                    className="relative overflow-hidden inline-flex min-h-12 items-center gap-2.5 rounded-[8px] bg-accent px-6 py-3 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isHolding && !prefersReducedMotion && (
                      <motion.span
                        aria-hidden="true"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, ease: 'linear' }}
                        className="absolute inset-0 origin-left bg-black/20"
                      />
                    )}
                    <Wind className="relative z-10 h-4 w-4" aria-hidden="true" />
                    <span className="relative z-10">
                      {isHolding ? 'Meniup perlahan...' : 'Tiup Lilin'}
                    </span>
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    onClick={handleRelight}
                    className="inline-flex min-h-12 items-center gap-2 rounded-[8px] border border-border-hairline bg-surface px-5 py-3 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Nyalakan Ulang</span>
                  </motion.button>
                )}

                <span className="text-xs text-muted">
                  {isLit
                    ? 'Klik sekali atau tahan 0,8 detik'
                    : 'Lilin telah padam'}
                </span>
              </div>
            </div>
          </ScrollRevealStage>

          <ScrollRevealStage variant="clip" delay={0.08} className="min-w-0 lg:col-span-6">
            <div className="paper-panel-tinted rounded-[12px] border px-6 py-10 sm:px-10 sm:py-12 text-center">
              <div className="mx-auto flex justify-center">
                <svg
                  viewBox="0 0 280 240"
                  className="h-56 w-64 text-ink"
                  role="img"
                  aria-label={
                    isLit
                      ? 'Ilustrasi kue ulang tahun dengan satu lilin menyala hangat di tengah senja'
                      : 'Ilustrasi kue ulang tahun dengan lilin baru saja dipadamkan dan kepulan asap tipis'
                  }
                >
                  <defs>
                    <radialGradient id="candle-twilight-halo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFE29E" stopOpacity="0.58" />
                      <stop offset="48%" stopColor="#EAA4B6" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#EAA4B6" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {isLit ? (
                    <motion.g
                      key="candle-flame"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1, scale: 1 }
                          : {
                              opacity: [0.94, 1, 0.96, 1],
                              scaleX: [1, 0.94, 1.04, 1],
                              scaleY: [1, 1.06, 0.97, 1],
                            }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.2 }
                          : {
                              duration: 2.1,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                      }
                      style={{ transformOrigin: '140px 76px' }}
                    >
                      {/* Focused warm candle halo standing out against the twilight sky */}
                      <circle cx="140" cy="56" r="46" fill="url(#candle-twilight-halo)" />
                      <path
                        d="M140 32 C150 47 154 60 150 70 C147 76 133 76 130 70 C126 60 130 47 140 32 Z"
                        fill="#F4B966"
                      />
                      <path
                        d="M140 46 C145 55 146 63 144 69 C142 72 138 72 136 69 C134 63 135 55 140 46 Z"
                        fill="#FFF6DF"
                      />
                    </motion.g>
                  ) : (
                    <motion.g
                      key="candle-smoke"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.path
                        d="M140 74 C135 63 146 53 139 40 C134 30 144 21 141 12"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        initial={
                          prefersReducedMotion
                            ? { opacity: 0.6 }
                            : { pathLength: 0, opacity: 0, y: 6 }
                        }
                        animate={
                          prefersReducedMotion
                            ? { opacity: 0.6 }
                            : { pathLength: 1, opacity: [0, 0.75, 0.35], y: -8 }
                        }
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                      />
                      <motion.path
                        d="M143 72 C149 62 141 51 148 39"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        initial={
                          prefersReducedMotion
                            ? { opacity: 0.4 }
                            : { pathLength: 0, opacity: 0, y: 4 }
                        }
                        animate={
                          prefersReducedMotion
                            ? { opacity: 0.4 }
                            : { pathLength: 1, opacity: [0, 0.5, 0.2], y: -10 }
                        }
                        transition={{ duration: 2.1, delay: 0.15, ease: 'easeOut' }}
                      />
                    </motion.g>
                  )}

                  <line
                    x1="140"
                    y1="76"
                    x2="140"
                    y2="88"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect
                    x="133"
                    y="88"
                    width="14"
                    height="46"
                    rx="2"
                    fill="var(--canvas)"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <rect
                    x="74"
                    y="134"
                    width="132"
                    height="58"
                    rx="6"
                    fill="var(--canvas)"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M74 152 Q96 164 118 152 T162 152 T206 152"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.35"
                  />
                  <line
                    x1="90"
                    y1="173"
                    x2="190"
                    y2="173"
                    stroke="var(--border-hairline)"
                    strokeWidth="1.2"
                  />

                  <line
                    x1="46"
                    y1="192"
                    x2="234"
                    y2="192"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M116 192 L124 214 L156 214 L164 192"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <line
                    x1="96"
                    y1="214"
                    x2="184"
                    y2="214"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-4 min-h-[5.5rem]" aria-live="polite">
                <AnimatePresence mode="wait">
                  {isLit ? (
                    <motion.div
                      key="lit-status"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22 }}
                      className="flex flex-col items-center"
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                        <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Lilin menyala di senja hari</span>
                      </span>
                      <p className="mt-2 font-serif text-xl text-ink">
                        Ambil napas sebentar, lalu sampaikan harapan terbaikmu.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="extinguished-status"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28 }}
                      className="flex flex-col items-center"
                    >
                      <p className="font-serif text-2xl font-medium text-ink">
                        Semoga segala hal baik menemukan jalannya kepadamu, {config.celebrantName}.
                      </p>
                      {wishText.trim() && (
                        <p className="mt-2.5 max-w-[44ch] text-sm italic text-muted">
                          Harapanmu tersimpan tenang: "{wishText.trim()}"
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ScrollRevealStage>
        </div>

        <AnimatePresence>
          {surpriseUnlocked && (
            <KeepsakeSurpriseCard
              config={config}
              wishText={wishText}
              isDark={isDark}
              onOpenPersonalize={onOpenPersonalize}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
