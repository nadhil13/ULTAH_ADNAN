import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Loader2,
  Moon,
  Pause,
  Play,
  SlidersHorizontal,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import type { SoundtrackContextValue } from '../hooks/useSoundtrack';
import { extractMonogram } from '../utils/birthdayMath';

interface NavbarProps {
  celebrantName: string;
  isDark: boolean;
  onToggleTheme: () => void;
  soundtrack: SoundtrackContextValue;
  onOpenPersonalize: () => void;
}

const NAV_LINKS = [
  { href: '#dedikasi', label: 'Dedikasi' },
  { href: '#babak', label: 'Babak' },
  { href: '#arsip', label: 'Arsip' },
  { href: '#surat', label: 'Surat' },
  { href: '#lilin', label: 'Lilin' },
  { href: '#ucapan', label: 'Ucapan' },
] as const;

// Set to true whenever the user requests the Ubah Data button to be shown again.
const SHOW_PERSONALIZE_BUTTON = false;

export function Navbar({
  celebrantName,
  isDark,
  onToggleTheme,
  soundtrack,
  onOpenPersonalize,
}: NavbarProps) {
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [volumePanelOpen, setVolumePanelOpen] = useState(false);
  const volumePopoverRef = useRef<HTMLDivElement | null>(null);

  const monogram = extractMonogram(celebrantName);
  const displayName =
    celebrantName.length > 22
      ? `${celebrantName.slice(0, 22).trim()}...`
      : celebrantName;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setVolumePanelOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!volumePanelOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumePopoverRef.current &&
        !volumePopoverRef.current.contains(event.target as Node)
      ) {
        setVolumePanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [volumePanelOpen]);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    scrollTo(href, -76);
  };

  const isLoading = soundtrack.playbackStatus === 'loading';
  const isPlaying = soundtrack.isPlaying;
  const pillActionLabel = isLoading
    ? 'Memuat lagu...'
    : isPlaying
      ? 'Diputar'
      : soundtrack.playbackStatus === 'paused'
        ? 'Jeda'
        : 'Cinta Terakhir';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 w-full transition-colors duration-200 ${scrolled
          ? 'header-glass border-b border-border-hairline'
          : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <a
          href="#beranda"
          onClick={(e) => handleNavClick(e, '#beranda')}
          className="inline-flex min-h-11 items-center font-serif text-lg font-medium tracking-tight text-ink whitespace-nowrap shrink-0 hover:text-accent transition-colors"
          aria-label={`Kembali ke beranda ${celebrantName}`}
        >
          <span className="hidden sm:inline">{displayName}</span>
          <span className="sm:hidden">{monogram}</span>
        </a>

        {/* Clean hairline ghost links on desktop */}
        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center gap-6 text-sm text-muted"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="inline-flex min-h-11 items-center whitespace-nowrap shrink-0 hover:text-ink transition-colors border-b border-transparent hover:border-accent/60"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Sleek airy desktop controls: ONE subtle pill for music, hairline ghost buttons for theme & personalize */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div ref={volumePopoverRef} className="relative hidden sm:flex items-center">
            <div className="paper-panel inline-flex items-center rounded-full border">
              <button
                type="button"
                onClick={soundtrack.toggle}
                aria-label={
                  isPlaying || isLoading
                    ? `Jeda lagu ${soundtrack.trackLabel}`
                    : `Putar lagu ${soundtrack.trackLabel}`
                }
                aria-pressed={isPlaying}
                className="inline-flex min-h-11 items-center gap-2 rounded-l-full pl-3.5 pr-3 text-xs font-medium text-ink hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden="true" />
                ) : isPlaying ? (
                  <Pause className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                )}
                <span>{pillActionLabel}</span>
                <span className="hidden xl:inline text-muted font-normal">
                  · Ari Lasso
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVolumePanelOpen((prev) => !prev)}
                aria-label="Pengaturan volume dan sumber lagu"
                aria-expanded={volumePanelOpen}
                className="inline-flex min-h-11 min-w-10 items-center justify-center rounded-r-full border-l border-border-hairline px-2.5 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                {soundtrack.isMuted || soundtrack.volume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {volumePanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.16 }}
                  className="elevated-sheet absolute right-0 top-13 z-50 w-68 rounded-[12px] border border-border-hairline bg-canvas p-4"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-border-hairline pb-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">
                        {soundtrack.trackLabel}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Status: {soundtrack.statusLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={soundtrack.toggleMute}
                      aria-label={soundtrack.isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-muted hover:bg-surface hover:text-ink transition-colors cursor-pointer shrink-0"
                    >
                      {soundtrack.isMuted || soundtrack.volume === 0 ? (
                        <VolumeX className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                      <span>Volume latar</span>
                      <span className="tabular-nums text-ink">
                        {soundtrack.isMuted ? 0 : Math.round(soundtrack.volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={soundtrack.isMuted ? 0 : soundtrack.volume}
                      onChange={(e) => soundtrack.setVolume(Number(e.target.value))}
                      aria-label="Pengatur volume musik latar"
                      className="w-full accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="mt-3 border-t border-border-hairline pt-2.5 flex items-center justify-between gap-2">
                    {soundtrack.sourceMode !== 'ambient' ? (
                      <button
                        type="button"
                        onClick={soundtrack.switchToAmbient}
                        className="text-xs font-medium text-accent hover:underline underline-offset-4 cursor-pointer py-1"
                      >
                        Gunakan melodi ambient bawaan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={soundtrack.switchToYouTube}
                        className="text-xs font-medium text-accent hover:underline underline-offset-4 cursor-pointer py-1"
                      >
                        Putar Cinta Terakhir (YouTube)
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-ink hover:bg-surface/80 hover:text-accent transition-colors cursor-pointer shrink-0"
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {SHOW_PERSONALIZE_BUTTON && (
            <button
              type="button"
              onClick={onOpenPersonalize}
              className="hidden sm:inline-flex min-h-11 items-center gap-1.5 rounded-[8px] px-3 text-xs font-medium text-ink hover:bg-surface/80 hover:text-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ubah Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="paper-panel inline-flex lg:hidden min-h-11 min-w-11 items-center justify-center rounded-[8px] border px-3.5 text-sm font-medium text-ink hover:border-accent transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? 'Tutup' : 'Menu'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-b border-border-hairline bg-canvas px-5 pb-6 pt-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <span className="text-sm font-medium text-muted">Daftar Halaman</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu navigasi"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-muted hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Navigasi seluler" className="mt-3 flex flex-col">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="flex min-h-11 items-center justify-between border-b border-border-hairline/60 py-2.5 text-base font-serif text-ink hover:text-accent transition-colors"
                >
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-5 flex flex-col gap-3">
              <div className="rounded-[10px] border border-border-hairline bg-surface px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={soundtrack.toggle}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
                    ) : isPlaying ? (
                      <Pause className="h-4 w-4 text-accent" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4 text-accent" aria-hidden="true" />
                    )}
                    <span>
                      {isLoading
                        ? 'Memuat lagu...'
                        : isPlaying
                          ? 'Jeda Lagu'
                          : 'Putar Lagu'}
                    </span>
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={soundtrack.isMuted ? 0 : soundtrack.volume}
                    onChange={(e) => soundtrack.setVolume(Number(e.target.value))}
                    aria-label="Volume musik latar"
                    className="w-24 accent-accent cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted border-t border-border-hairline pt-2">
                  <span className="truncate">{soundtrack.trackLabel}</span>
                  {soundtrack.sourceMode !== 'ambient' ? (
                    <button
                      type="button"
                      onClick={soundtrack.switchToAmbient}
                      className="text-accent font-medium underline underline-offset-4 cursor-pointer py-1"
                    >
                      Melodi ambient
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={soundtrack.switchToYouTube}
                      className="text-accent font-medium underline underline-offset-4 cursor-pointer py-1"
                    >
                      Lagu YouTube
                    </button>
                  )}
                </div>
              </div>

              {SHOW_PERSONALIZE_BUTTON && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPersonalize();
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span>Ubah Data Monograf</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
