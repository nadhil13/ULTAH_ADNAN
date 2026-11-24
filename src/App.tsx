import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ARCHIVE_PHOTOS,
  DEFAULT_BIRTHDAY_CONFIG,
  STORAGE_KEYS,
  type ArchiveCategory,
  type ArchivePhoto,
  type BirthdayConfig,
  type WishEntry,
} from './data/birthdayConfig';
import { SmoothScrollProvider } from './hooks/useSmoothScroll';
import { useAmbientAudio } from './hooks/useAmbientAudio';
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

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(loadInitialConfig);
  const [wishes, setWishes] = useState<WishEntry[]>(loadInitialWishes);
  const [photos, setPhotos] = useState<ArchivePhoto[]>(DEFAULT_ARCHIVE_PHOTOS);
  const [isDark, setIsDark] = useState<boolean>(loadInitialTheme);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);

  const objectUrlsRef = useRef<string[]>([]);
  const audio = useAmbientAudio();

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

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleSaveConfig = useCallback((nextConfig: BirthdayConfig) => {
    setConfig(nextConfig);
  }, []);

  const handleResetDefault = useCallback(() => {
    setConfig(DEFAULT_BIRTHDAY_CONFIG);
    audio.clearCustomAudio();
    try {
      window.localStorage.removeItem(STORAGE_KEYS.config);
    } catch {
      // Ignore storage removal errors.
    }
  }, [audio]);

  const handleAddLocalPhoto = useCallback(
    (file: File, category: Exclude<ArchiveCategory, 'Semua'>) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const todayLabel = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());

      const newPhoto: ArchivePhoto = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        src: objectUrl,
        alt: cleanTitle ? `Foto lokal: ${cleanTitle}` : 'Foto lokal unggahan pengguna',
        caption: cleanTitle
          ? `${cleanTitle}, ditambahkan ke arsip sesi ini.`
          : 'Foto lokal yang baru saja ditambahkan ke arsip sesi ini.',
        dateLabel: `Unggahan lokal, ${todayLabel}`,
        category,
        aspect: '4/3',
        isUserUploaded: true,
      };

      setPhotos((prev) => [newPhoto, ...prev]);
    },
    []
  );

  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.isUserUploaded) {
        URL.revokeObjectURL(target.src);
      }
      return prev.filter((item) => item.id !== id);
    });
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
          onToggleTheme={handleToggleTheme}
          isPlayingAudio={audio.isPlaying}
          audioVolume={audio.volume}
          customTrackName={audio.customTrackName}
          onToggleAudio={audio.toggle}
          onChangeVolume={audio.setVolume}
          onOpenPersonalize={() => setPersonalizeOpen(true)}
        />

        <ChapterRail />

        <main id="konten-utama" className="relative z-10">
          <HeroSection
            config={config}
            onOpenPersonalize={() => setPersonalizeOpen(true)}
            onStartAudio={audio.startIfPaused}
          />

          <DedicationSection
            dedicationParagraph={config.dedicationParagraph}
            dedicationClosingPhrase={config.dedicationClosingPhrase}
            senderName={config.senderName}
          />

          <ChaptersSection />

          <ArchiveSection
            photos={photos}
            onAddLocalPhoto={handleAddLocalPhoto}
            onRemovePhoto={handleRemovePhoto}
          />

          <LetterSection config={config} />

          <CandleSection
            config={config}
            isDark={isDark}
            onOpenPersonalize={() => setPersonalizeOpen(true)}
          />

          <WishWallSection
            wishes={wishes}
            celebrantName={config.celebrantName}
            onAddWish={handleAddWish}
            onDeleteWish={handleDeleteWish}
          />
        </main>

        <Footer
          celebrantName={config.celebrantName}
          senderName={config.senderName}
        />

        <PersonalizationDrawer
          isOpen={personalizeOpen}
          config={config}
          customTrackName={audio.customTrackName}
          onClose={() => setPersonalizeOpen(false)}
          onSave={handleSaveConfig}
          onResetDefault={handleResetDefault}
          onUploadCustomAudio={audio.loadCustomAudio}
          onClearCustomAudio={audio.clearCustomAudio}
        />
      </div>
    </SmoothScrollProvider>
  );
}
