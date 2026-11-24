import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Music, RotateCcw, Upload, X } from 'lucide-react';
import {
  DEFAULT_PORTRAIT_IMAGE,
  type BirthdayConfig,
} from '../data/birthdayConfig';
import { parseLetterTextToParagraphs } from '../utils/validation';

interface PersonalizationDrawerProps {
  isOpen: boolean;
  config: BirthdayConfig;
  customTrackName: string | null;
  onClose: () => void;
  onSave: (nextConfig: BirthdayConfig) => void;
  onResetDefault: () => void;
  onUploadCustomAudio: (file: File) => void;
  onClearCustomAudio: () => void;
}

export function PersonalizationDrawer({
  isOpen,
  config,
  customTrackName,
  onClose,
  onSave,
  onResetDefault,
  onUploadCustomAudio,
  onClearCustomAudio,
}: PersonalizationDrawerProps) {
  const [celebrantName, setCelebrantName] = useState(config.celebrantName);
  const [turningAge, setTurningAge] = useState(config.turningAge);
  const [birthplace, setBirthplace] = useState(config.birthplace);
  const [birthdate, setBirthdate] = useState(config.birthdate);
  const [senderName, setSenderName] = useState(config.senderName);
  const [portraitUrl, setPortraitUrl] = useState(config.portraitUrl);
  const [portraitCaption, setPortraitCaption] = useState(config.portraitCaption);
  const [letterText, setLetterText] = useState(config.letterBody.join('\n\n'));
  const [surpriseTitle, setSurpriseTitle] = useState(config.surpriseTitle);
  const [surpriseSubtitle, setSurpriseSubtitle] = useState(config.surpriseSubtitle);
  const [surpriseNote, setSurpriseNote] = useState(config.surpriseNote);
  const [portraitNotice, setPortraitNotice] = useState<string | null>(null);

  const portraitInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCelebrantName(config.celebrantName);
      setTurningAge(config.turningAge);
      setBirthplace(config.birthplace);
      setBirthdate(config.birthdate);
      setSenderName(config.senderName);
      setPortraitUrl(config.portraitUrl);
      setPortraitCaption(config.portraitCaption);
      setLetterText(config.letterBody.join('\n\n'));
      setSurpriseTitle(config.surpriseTitle);
      setSurpriseSubtitle(config.surpriseSubtitle);
      setSurpriseNote(config.surpriseNote);
      setPortraitNotice(null);
    }
  }, [config, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handlePortraitFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPortraitUrl(reader.result);
        setPortraitCaption(`Potret lokal: ${file.name}`);
        setPortraitNotice(`Foto "${file.name}" siap disimpan.`);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAudioFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onUploadCustomAudio(file);
    event.target.value = '';
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedParagraphs = parseLetterTextToParagraphs(letterText);
    const cleanedCelebrant = celebrantName.trim() || config.celebrantName;
    const cleanedSender = senderName.trim() || config.senderName;
    const cleanedAge = turningAge.trim() || config.turningAge;

    onSave({
      ...config,
      celebrantName: cleanedCelebrant,
      turningAge: cleanedAge,
      birthplace: birthplace.trim() || config.birthplace,
      birthdate: birthdate.trim() || config.birthdate,
      senderName: cleanedSender,
      portraitUrl: portraitUrl || DEFAULT_PORTRAIT_IMAGE,
      portraitCaption: portraitCaption.trim() || config.portraitCaption,
      letterSalutation: `Untuk ${cleanedCelebrant},`,
      letterBody: parsedParagraphs.length > 0 ? parsedParagraphs : config.letterBody,
      surpriseTitle: surpriseTitle.trim() || config.surpriseTitle,
      surpriseSubtitle: surpriseSubtitle.trim() || config.surpriseSubtitle,
      surpriseNote: surpriseNote.trim() || config.surpriseNote,
      customAudioName: customTrackName,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="personalize-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-end bg-black/60"
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="elevated-sheet flex h-full w-full max-w-lg flex-col border-l border-border-hairline bg-canvas"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border-hairline px-6 py-4">
              <div>
                <h2 id="personalize-title" className="font-serif text-xl font-medium text-ink">
                  Ubah Data Monograf
                </h2>
                <p className="text-xs text-muted">
                  Perubahan langsung diterapkan dan disimpan di peramban ini.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup panel Ubah Data"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-border-hairline text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="cfg-celebrant"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Nama penerima
                  </label>
                  <input
                    id="cfg-celebrant"
                    type="text"
                    value={celebrantName}
                    onChange={(e) => setCelebrantName(e.target.value)}
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-age"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Usia yang dirayakan
                  </label>
                  <input
                    id="cfg-age"
                    type="text"
                    value={turningAge}
                    onChange={(e) => setTurningAge(e.target.value)}
                    placeholder="Contoh: 22"
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="cfg-birthplace"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Tempat lahir
                  </label>
                  <input
                    id="cfg-birthplace"
                    type="text"
                    value={birthplace}
                    onChange={(e) => setBirthplace(e.target.value)}
                    placeholder="Contoh: Sungai Sirah"
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-birthdate"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Tanggal lahir
                  </label>
                  <input
                    id="cfg-birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cfg-sender"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Nama pengirim
                </label>
                <input
                  id="cfg-sender"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                />
              </div>

              <div className="border-t border-border-hairline pt-5">
                <p className="text-sm font-medium text-ink mb-2">Potret halaman pembuka</p>
                <input
                  ref={portraitInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePortraitFile}
                  className="sr-only"
                  aria-label="Unggah foto potret halaman pembuka"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => portraitInputRef.current?.click()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>Pilih Foto Lokal</span>
                  </button>
                  {portraitUrl !== DEFAULT_PORTRAIT_IMAGE && (
                    <button
                      type="button"
                      onClick={() => {
                        setPortraitUrl(DEFAULT_PORTRAIT_IMAGE);
                        setPortraitCaption(
                          'Lembaran arsip edisi khusus, siap diganti dengan potret pilihanmu.'
                        );
                        setPortraitNotice('Kembali ke karya kertas arsip bawaan.');
                      }}
                      className="inline-flex min-h-11 items-center rounded-[8px] px-3 text-xs text-muted hover:text-accent cursor-pointer"
                    >
                      Gunakan Bawaan
                    </button>
                  )}
                </div>
                {portraitNotice && (
                  <p className="mt-2 text-xs text-muted">{portraitNotice}</p>
                )}
              </div>

              <div className="border-t border-border-hairline pt-5">
                <p className="text-sm font-medium text-ink mb-2">
                  Musik latar pribadi (opsional)
                </p>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFile}
                  className="sr-only"
                  aria-label="Unggah berkas audio lokal untuk musik latar"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-border-hairline bg-surface px-4 py-2 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    <Music className="h-4 w-4" aria-hidden="true" />
                    <span>Unggah Audio Lokal</span>
                  </button>
                  {customTrackName && (
                    <button
                      type="button"
                      onClick={onClearCustomAudio}
                      className="inline-flex min-h-11 items-center rounded-[8px] px-3 text-xs text-muted hover:text-accent cursor-pointer"
                    >
                      Kembali ke Ambient Bawaan
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">
                  {customTrackName
                    ? `Aktif: ${customTrackName} (tekan Musik di bilah atas untuk memutar)`
                    : 'Saat ini memakai instrumen ambient Web Audio bawaan.'}
                </p>
              </div>

              <div className="border-t border-border-hairline pt-5">
                <label
                  htmlFor="cfg-letter"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Isi surat ulang tahun
                </label>
                <p className="text-xs text-muted mb-2">
                  Pisahkan antar paragraf dengan satu baris kosong.
                </p>
                <textarea
                  id="cfg-letter"
                  rows={7}
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  className="w-full rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink focus:border-accent"
                />
              </div>

              <div className="border-t border-border-hairline pt-5 space-y-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    Kartu Kejutan Terakhir (terbuka setelah tiup lilin)
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Ubah janji atau kupon hadiah pribadi yang muncul saat lilin dipadamkan.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="cfg-surprise-title"
                    className="block text-xs font-medium text-ink mb-1.5"
                  >
                    Judul kupon kejutan
                  </label>
                  <input
                    id="cfg-surprise-title"
                    type="text"
                    value={surpriseTitle}
                    onChange={(e) => setSurpriseTitle(e.target.value)}
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-surprise-subtitle"
                    className="block text-xs font-medium text-ink mb-1.5"
                  >
                    Keterangan berlaku
                  </label>
                  <input
                    id="cfg-surprise-subtitle"
                    type="text"
                    value={surpriseSubtitle}
                    onChange={(e) => setSurpriseSubtitle(e.target.value)}
                    className="w-full min-h-11 rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-surprise-note"
                    className="block text-xs font-medium text-ink mb-1.5"
                  >
                    Catatan singkat pada kupon
                  </label>
                  <textarea
                    id="cfg-surprise-note"
                    rows={3}
                    value={surpriseNote}
                    onChange={(e) => setSurpriseNote(e.target.value)}
                    className="w-full rounded-[8px] border border-border-hairline bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-hairline pt-5 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    onResetDefault();
                    onClose();
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-border-hairline px-4 py-2.5 text-xs font-medium text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-accent px-6 py-2.5 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
