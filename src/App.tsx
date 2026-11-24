import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_ARCHIVE_PHOTOS,
  DEFAULT_BIRTHDAY_CONFIG,
  STORAGE_KEYS,
  type ArchivePhoto,
  type BirthdayConfig,
  type WishEntry,
} from './data/birthdayConfig';
import { SmoothScrollProvider } from './hooks/useSmoothScroll';
import { SoundtrackProvider, useSoundtrack } from './hooks/useSoundtrack';
import { normalizeConfig, normalizeWishes } from './utils/validation';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DedicationSection } from './components/DedicationSection';
import { ChaptersSection } from './components/ChaptersSection';
import { ArchiveSection } from './components/ArchiveSection';
import { LetterSection } from './components/LetterSection';
import { CandleSection } from './components/CandleSection';
import { WishWallSection } from './components/WishWallSection';
import { PersonalizationDrawer } from './components/PersonalizationDrawer';
import { ChapterRail } from './components/ChapterRail';
import { Footer } from './components/Footer';
import { LivingHeritageBackdrop } from './components/LivingHeritageBackdrop';

function loadInitialConfig(): BirthdayConfig {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.config);
    if (!stored) {
      return DEFAULT_BIRTHDAY_CONFIG;
    }
    return normalizeConfig(JSON.parse(stored), DEFAULT_BIRTHDAY_CONFIG);
  } catch {
    return DEFAULT_BIRTHDAY_CONFIG;
  }
}

function loadInitialWishes(): WishEntry[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.wishes);
    if (!stored) {
      return [];
    }
    return normalizeWishes(JSON.parse(stored));
  } catch {
    return [];
  }
}

function loadInitialTheme(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.theme) === 'dark';
  } catch {
    return false;
  }
}

interface MonographContentProps {
  config: BirthdayConfig;
  wishes: WishEntry[];
  photos: ArchivePhoto[];
  isDark: boolean;
  personalizeOpen: boolean;
  onToggleTheme: () => void;
  onOpenPersonalize: () => void;
  onClosePersonalize: () => void;
  onSaveConfig: (nextConfig: BirthdayConfig) => void;
  onResetDefaultConfig: () => void;
  onAddWish: (entry: Omit<WishEntry, 'id' | 'createdAt'>) => void;
  onDeleteWish: (id: string) => void;
}

function MonographContent({
  config,
  wishes,
  photos,
  isDark,
  personalizeOpen,
  onToggleTheme,
  onOpenPersonalize,
  onClosePersonalize,
  onSaveConfig,
  onResetDefaultConfig,
  onAddWish,
  onDeleteWish,
}: MonographContentProps) {
  const soundtrack = useSoundtrack();

  const handleResetAll = useCallback(() => {
    soundtrack.clearCustomAudio();
    onResetDefaultConfig();
  }, [onResetDefaultConfig, soundtrack]);

  return (
    <div className="relative min-h-screen text-ink">
      <LivingHeritageBackdrop isDark={isDark} />

      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[8px] focus:bg-accent focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-accent-ink"
      >
        Langsung ke isi utama
      </a>

      <Navbar
        celebrantName={config.celebrantName}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        soundtrack={soundtrack}
        onOpenPersonalize={onOpenPersonalize}
      />

      <ChapterRail />

      <main id="konten-utama" className="relative z-10">
        <HeroSection
          config={config}
          onOpenPersonalize={onOpenPersonalize}
          onStartAudio={soundtrack.playFromGesture}
        />

        <DedicationSection
          dedicationParagraph={config.dedicationParagraph}
          dedicationClosingPhrase={config.dedicationClosingPhrase}
          senderName={config.senderName}
        />

        <ChaptersSection />

        <ArchiveSection
          photos={photos}
          onSetAudioDucking={soundtrack.setDucking}
        />

        <LetterSection config={config} />

        <CandleSection
          config={config}
          isDark={isDark}
          onOpenPersonalize={onOpenPersonalize}
        />

        <WishWallSection
          wishes={wishes}
          celebrantName={config.celebrantName}
          onAddWish={onAddWish}
          onDeleteWish={onDeleteWish}
        />
      </main>

      <Footer
        celebrantName={config.celebrantName}
        senderName={config.senderName}
      />

      <PersonalizationDrawer
        isOpen={personalizeOpen}
        config={config}
        customTrackName={soundtrack.customTrackName}
        onClose={onClosePersonalize}
        onSave={onSaveConfig}
        onResetDefault={handleResetAll}
        onUploadCustomAudio={soundtrack.loadCustomAudio}
        onClearCustomAudio={soundtrack.clearCustomAudio}
      />
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(loadInitialConfig);
  const [wishes, setWishes] = useState<WishEntry[]>(loadInitialWishes);
  const photos = DEFAULT_ARCHIVE_PHOTOS;
  const [isDark, setIsDark] = useState<boolean>(loadInitialTheme);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage quota errors in restricted browsing contexts.
    }
  }, [isDark]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
    } catch {
      // Ignore storage quota errors when large local portrait images exceed quota.
    }
  }, [config]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.wishes, JSON.stringify(wishes));
    } catch {
      // Ignore storage quota errors in restricted browsing contexts.
    }
  }, [wishes]);

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleSaveConfig = useCallback((nextConfig: BirthdayConfig) => {
    setConfig(nextConfig);
  }, []);

  const handleResetDefaultConfig = useCallback(() => {
    setConfig(DEFAULT_BIRTHDAY_CONFIG);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.config);
    } catch {
      // Ignore storage removal errors.
    }
  }, []);

  const handleAddWish = useCallback((entry: Omit<WishEntry, 'id' | 'createdAt'>) => {
    const newWish: WishEntry = {
      id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: entry.name,
      relation: entry.relation,
      message: entry.message,
      createdAt: new Date().toISOString(),
    };
    setWishes((prev) => [newWish, ...prev]);
  }, []);

  const handleDeleteWish = useCallback((id: string) => {
    setWishes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <SmoothScrollProvider>
      <SoundtrackProvider youtubeVideoId={config.youtubeVideoId}>
        <MonographContent
          config={config}
          wishes={wishes}
          photos={photos}
          isDark={isDark}
          personalizeOpen={personalizeOpen}
          onToggleTheme={handleToggleTheme}
          onOpenPersonalize={() => setPersonalizeOpen(true)}
          onClosePersonalize={() => setPersonalizeOpen(false)}
          onSaveConfig={handleSaveConfig}
          onResetDefaultConfig={handleResetDefaultConfig}
          onAddWish={handleAddWish}
          onDeleteWish={handleDeleteWish}
        />
      </SoundtrackProvider>
    </SmoothScrollProvider>
  );
}
