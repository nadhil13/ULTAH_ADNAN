export type ArchiveCategory = 'Semua' | 'Perjalanan' | 'Momen Kecil' | 'Bersama';

export interface ChapterItem {
  id: string;
  index: string;
  period: string;
  title: string;
  summary: string;
  note: string;
  layoutVariant: 'wide-offset' | 'split-caption' | 'quote-highlight' | 'closing-folio';
}

export interface ArchivePhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  dateLabel: string;
  category: Exclude<ArchiveCategory, 'Semua'>;
  aspect: '4/5' | '16/10' | '1/1' | '4/3';
  isUserUploaded?: boolean;
}

export interface BirthdayConfig {
  celebrantName: string;
  turningAge: string;
  birthdate: string;
  senderName: string;
  heroOpeningLine: string;
  portraitUrl: string;
  portraitCaption: string;
  dedicationParagraph: string;
  dedicationClosingPhrase: string;
  letterSalutation: string;
  letterBody: string[];
  letterClosing: string;
  surpriseTitle: string;
  surpriseSubtitle: string;
  surpriseNote: string;
  customAudioName: string | null;
}

export interface WishEntry {
  id: string;
  name: string;
  relation: string;
  message: string;
  createdAt: string;
}

export const DEFAULT_PORTRAIT_IMAGE =
  '/src/assets/images/hero_archival_paper_1795494087630.jpg';

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  celebrantName: '[NAMA PENERIMA]',
  turningAge: '[USIA]',
  birthdate: '2005-03-13',
  senderName: '[NAMA PENGIRIM]',
  heroOpeningLine:
    'Sebuah ruang tenang untuk menyimpan cerita, potongan hari yang hangat, dan doa baik pada pergantian usiamu.',
  portraitUrl: DEFAULT_PORTRAIT_IMAGE,
  portraitCaption: 'Lembaran arsip edisi khusus, siap diganti dengan potret pilihanmu.',
  dedicationParagraph:
    'Bertambah usia bukan sekadar menghitung angka di kalender, melainkan merawat setiap jejak yang membuatmu tetap menjadi diri sendiri. Semoga tahun yang baru ini memberimu ruang lebih luas untuk bernapas, waktu yang cukup untuk hal yang benar benar berarti, serta keberanian yang tenang saat melangkah ke babak berikutnya.',
  dedicationClosingPhrase:
    'Terima kasih sudah bertumbuh sejauh ini dengan cara yang jujur dan hangat.',
  letterSalutation: 'Untuk [NAMA PENERIMA],',
  letterBody: [
    'Hari ini menjadi penanda satu putaran lagi yang telah kamu lalui dengan segala dinamikanya. Tidak semua hari berjalan ringan, tetapi cara kamu bertahan dan tetap peduli pada hal hal kecil di sekitarmu layak dirayakan dengan penuh rasa syukur.',
    'Di usia yang baru ini, semoga langkahmu selalu ditemani kesehatan yang terjaga, pikiran yang jernih, dan orang orang yang mengerti kapan harus berbicara serta kapan cukup duduk menemani. Kamu tidak perlu terburu buru mengejar standar siapa pun, cukup berjalan pada ritme yang terasa paling jujur bagimu.',
    'Simpan halaman ini kapan saja kamu ingin mengingat bahwa kehadiranmu berarti. Selamat ulang tahun, semoga setiap bulan ke depan membawa kabar baik yang tenang dan menetap lama.',
  ],
  letterClosing: 'Dengan doa yang hangat,',
  surpriseTitle: 'Kupon Makan Malam dan Jalan Jalan Pilihanmu',
  surpriseSubtitle: 'Berlaku kapan saja sepanjang tahun usiamu yang baru',
  surpriseNote:
    'Pilih tempat makan, kedai kopi, atau rute perjalanan singkat yang paling ingin kamu datangi. Cukup tunjukkan kartu ini untuk menukarkannya.',
  customAudioName: null,
};

export const CHAPTERS_DATA: ChapterItem[] = [
  {
    id: 'babak-01',
    index: '01',
    period: 'Langkah Awal',
    title: 'Belajar Mengenal Dunia dengan Rasa Ingin Tahu',
    summary:
      'Setiap kebiasaan baik hari ini berakar dari hari hari sederhana di masa lalu. Dari pertanyaan kecil yang terus dicari jawabannya hingga keberanian mencoba hal baru tanpa takut salah.',
    note: 'Catatan: kamu dapat menyesuaikan kisah tiap babak langsung di berkas konfigurasi.',
    layoutVariant: 'wide-offset',
  },
  {
    id: 'babak-02',
    index: '02',
    period: 'Masa Bertumbuh',
    title: 'Menemukan Ritme Sendiri di Tengah Banyak Pilihan',
    summary:
      'Ada masa ketika segala sesuatu terasa bergerak cepat. Di titik itu, kamu mulai memilih mana yang perlu diperjuangkan dan mana yang pantas dilepaskan dengan lapang.',
    note: 'Keputusan kecil yang diambil dengan sadar sering kali mengubah arah perjalanan paling jauh.',
    layoutVariant: 'split-caption',
  },
  {
    id: 'babak-03',
    index: '03',
    period: 'Jeda yang Jujur',
    title: 'Merawat Hal Hal Sederhana yang Membuat Hati Utuh',
    summary:
      'Di sela kesibukan, kamu belajar bahwa istirahat bukan tanda berhenti. Secangkir minuman hangat di pagi hari, percakapan tanpa tergesa, dan sore yang tenang selalu cukup untuk memulihkan tenaga.',
    note: 'Ketekunan yang paling tahan lama selalu tumbuh bersama ketenangan.',
    layoutVariant: 'quote-highlight',
  },
  {
    id: 'babak-04',
    index: '04',
    period: 'Lembaran Baru',
    title: 'Menyambut Tahun yang Baru dengan Ruang Lebih Lapang',
    summary:
      'Usia baru membuka halaman yang masih bersih. Semoga kamu melangkah dengan hati yang ringan, tetap rendah hati saat berhasil, dan tetap ramah pada diri sendiri ketika sedang belajar.',
    note: 'Babak ini baru saja dimulai hari ini.',
    layoutVariant: 'closing-folio',
  },
];

export const DEFAULT_ARCHIVE_PHOTOS: ArchivePhoto[] = [
  {
    id: 'arsip-01',
    src: '/src/assets/images/archive_morning_train_1795494077449.jpg',
    alt: 'Pemandangan kabut pagi di perbukitan dari jendela kereta',
    caption: 'Pagi yang pelan dari balik jendela kereta, saat udara masih dingin dan jalan masih panjang.',
    dateLabel: 'Arsip 01, Perjalanan',
    category: 'Perjalanan',
    aspect: '16/10',
  },
  {
    id: 'arsip-02',
    src: '/src/assets/images/archive_quiet_coffee_1795494204809.jpg',
    alt: 'Secangkir kopi hitam keramik di samping buku catatan bersampul linen dan pena kuningan',
    caption: 'Meja pagi sebelum hari dimulai: kopi hangat, buku catatan, dan pikiran yang tenang.',
    dateLabel: 'Arsip 02, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-03',
    src: '/src/assets/images/archive_dusk_rain_1795494079075.jpg',
    alt: 'Tetesan hujan pada kaca jendela kayu saat senja dengan lampu jalan berpendar lembut',
    caption: 'Hujan senja yang membuat langkah melambat sejenak, menyisakan percakapan yang hangat.',
    dateLabel: 'Arsip 03, Perjalanan',
    category: 'Perjalanan',
    aspect: '1/1',
  },
  {
    id: 'arsip-04',
    src: '/src/assets/images/archive_linen_books_1795494088722.jpg',
    alt: 'Tumpukan buku bersampul kain di atas linen pucat bersama sekuntum kamelia merah tua',
    caption: 'Tumpukan bacaan dan jeda sore yang selalu menyenangkan untuk dikenang kembali.',
    dateLabel: 'Arsip 04, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/3',
  },
  {
    id: 'arsip-05',
    src: '/src/assets/images/archive_sunlit_corridor_1795496376381.jpg',
    alt: 'Cahaya sore yang membentuk bayangan jendela di koridor galeri yang tenang dengan bangku kayu',
    caption: 'Koridor sore dengan bayangan jendela yang panjang, tempat langkah berhenti sebentar.',
    dateLabel: 'Arsip 05, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/3',
  },
  {
    id: 'arsip-06',
    src: '/src/assets/images/archive_evening_tea_1795496371540.jpg',
    alt: 'Teko keramik gelap dan cangkir kecil di atas kain linen bersama lilin lebah dalam tempat kuningan',
    caption: 'Teh hangat di penghujung hari sebelum malam benar benar turun dengan tenang.',
    dateLabel: 'Arsip 06, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
];

export const ARCHIVE_CATEGORIES: ArchiveCategory[] = [
  'Semua',
  'Perjalanan',
  'Momen Kecil',
  'Bersama',
];

export const STORAGE_KEYS = {
  config: 'monograf_ulang_tahun_config_v1',
  wishes: 'monograf_ulang_tahun_wishes_v1',
  theme: 'monograf_ulang_tahun_theme_v1',
} as const;
