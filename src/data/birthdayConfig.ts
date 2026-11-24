export type ArchiveCategory = 'Semua' | 'Perjalanan' | 'Momen Kecil' | 'Bersama';

export interface ChapterItem {
  id: string;
  index: string;
  period: string;
  title: string;
  summary: string;
  note: string;
  plateSrc: string;
  plateAlt: string;
  plateCaption: string;
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
  birthplace: string;
  birthdate: string;
  senderName: string;
  coverHeaderLine: string;
  coverSubtitle: string;
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
  celebrantName: 'Dinda Hendra Putri',
  turningAge: '22',
  birthplace: 'Sungai Sirah',
  birthdate: '2004-11-24',
  senderName: 'Orang Terdekatmu',
  coverHeaderLine: 'Untuk merayakan dua puluh dua tahun',
  coverSubtitle: 'Merayakan dua puluh dua tahun perjalanan',
  heroOpeningLine:
    'Sebuah lembaran tenang untuk merayakan dua puluh dua tahun perjalananmu sejak Sungai Sirah, menyimpan kenangan kecil, dan mengirim doa terbaik bagi langkahmu berikutnya.',
  portraitUrl: DEFAULT_PORTRAIT_IMAGE,
  portraitCaption: 'Bingkai arsip edisi 22 tahun, ganti dengan foto asli Dinda di Ubah Data.',
  dedicationParagraph:
    'Dua puluh dua tahun sejak pagi pertama di Sungai Sirah bukan sekadar deretan angka di kalender, melainkan jejak ketekunan, kelembutan, dan keberanianmu bertumbuh menjadi diri sendiri. Semoga tahun baru dalam usiamu ini selalu memberimu ruang lebih luas untuk bernapas, waktu yang cukup bagi hal yang benar benar berarti, serta langkah yang teduh di mana pun kamu berada.',
  dedicationClosingPhrase:
    'Terima kasih sudah bertumbuh sejauh ini dengan hati yang hangat dan jujur, Dinda.',
  letterSalutation: 'Untuk Dinda Hendra Putri,',
  letterBody: [
    'Selamat memasuki usia dua puluh dua tahun, Dinda. Hari ini menjadi pengingat yang lembut atas semua perjalanan yang sudah kamu tempuh sejak langkah pertamamu di Sungai Sirah hingga hari ini. Tidak semua musim berjalan ringan, tetapi ketenanganmu saat bertahan dan caramu tetap peduli pada orang di sekitarmu layak dirayakan dengan penuh syukur.',
    'Di babak usia 22 ini, semoga kesehatan selalu menyertaimu, pikiranmu tetap lapang di tengah hari yang padat, dan setiap keputusan penting yang kamu ambil membawa kedamaian. Kamu tidak perlu terburu buru mengikuti ukuran siapa pun, cukup melangkah pada irama yang paling jujur bagi hatimu sendiri.',
    'Kapan pun hari terasa panjang, bukalah kembali lembaran ini untuk mengingat bahwa kehadiranmu selalu berarti. Semoga bulan bulan menuju tahun berikutnya dipenuhi kabar baik yang menetap lama.',
  ],
  letterClosing: 'Dengan doa yang tulus dan hangat,',
  surpriseTitle: 'Kupon Makan Malam dan Jalan Jalan Pilihan Dinda',
  surpriseSubtitle: 'Berlaku kapan saja sepanjang usia 22 tahun',
  surpriseNote:
    'Pilih tempat makan favorit, kedai kopi yang ingin disinggahi, atau perjalanan sore yang tenang bersama. Tunjukkan kartu ini kapan pun kamu ingin menukarkannya.',
  customAudioName: null,
};

export const CHAPTERS_DATA: ChapterItem[] = [
  {
    id: 'babak-01',
    index: '01',
    period: 'Akar di Sungai Sirah',
    title: 'Langkah Pertama dari Tanah yang Hangat',
    summary:
      'Setiap kebaikan yang tumbuh dalam dirimu hari ini berawal dari hari hari sederhana di masa kecil. Dari rasa ingin tahu yang tulus hingga kehangatan rumah yang mengajarkan arti pulang dan syukur.',
    note: 'Akar yang tenang selalu memberi kekuatan pada ranting yang tumbuh tinggi.',
    plateSrc: '/src/assets/images/archive_morning_train_1795494077449.jpg',
    plateAlt: 'Kabut pagi di perbukitan hijau yang dilihat dari balik jendela kereta',
    plateCaption: 'Pagi di perbukitan, ganti dengan foto asli Dinda',
    layoutVariant: 'wide-offset',
  },
  {
    id: 'babak-02',
    index: '02',
    period: 'Masa Bertumbuh',
    title: 'Menemukan Irama Sendiri di Tengah Banyak Pilihan',
    summary:
      'Memasuki awal dua puluhan membawa banyak persimpangan baru. Di fase ini, kamu belajar memilih mana yang patut diperjuangkan dengan sungguh sungguh dan mana yang lebih baik dilepaskan dengan lapang.',
    note: 'Keputusan kecil yang diambil dengan jernih sering kali membawa perjalanan paling jauh.',
    plateSrc: '/src/assets/images/archive_quiet_coffee_1795494204809.jpg',
    plateAlt: 'Secangkir kopi keramik hangat di samping buku catatan bersampul linen',
    plateCaption: 'Catatan pagi dan jeda belajar, ganti dengan foto asli Dinda',
    layoutVariant: 'split-caption',
  },
  {
    id: 'babak-03',
    index: '03',
    period: 'Jeda yang Jujur',
    title: 'Merawat Hal Hal Sederhana yang Membuat Hati Utuh',
    summary:
      'Di sela kesibukan, kamu membuktikan bahwa beristirahat bukanlah tanda berhenti. Secangkir minuman hangat, hujan sore yang pelan, dan percakapan tanpa tergesa selalu cukup untuk mengisi ulang tenaga.',
    note: 'Ketekunan yang paling tahan lama selalu berjalan beriringan dengan ketenangan.',
    plateSrc: '/src/assets/images/archive_linen_books_1795494088722.jpg',
    plateAlt: 'Tumpukan buku bersampul kain di atas linen lembut dengan sekuntum kamelia merah tua',
    plateCaption: 'Bacaan sore yang tenang, ganti dengan foto asli Dinda',
    layoutVariant: 'quote-highlight',
  },
  {
    id: 'babak-04',
    index: '04',
    period: 'Menyambut Usia 22',
    title: 'Membuka Lembaran Baru dengan Ruang Lebih Lapang',
    summary:
      'Dua puluh dua tahun membuka halaman yang masih bersih dan penuh kemungkinan. Semoga kamu terus melangkah dengan hati ringan, tetap rendah hati saat berhasil, dan tetap ramah pada diri sendiri ketika belajar.',
    note: 'Babak usia 22 tahun resmi dimulai hari ini, 24 November 2026.',
    plateSrc: '/src/assets/images/archive_sunlit_corridor_1795496376381.jpg',
    plateAlt: 'Cahaya sore yang jatuh lembut di sepanjang koridor galeri dengan bangku kayu',
    plateCaption: 'Cahaya sore menuju babak baru, ganti dengan foto asli Dinda',
    layoutVariant: 'closing-folio',
  },
];

export const DEFAULT_ARCHIVE_PHOTOS: ArchivePhoto[] = [
  {
    id: 'arsip-01',
    src: '/src/assets/images/archive_morning_train_1795494077449.jpg',
    alt: 'Pemandangan kabut pagi di perbukitan dari jendela kereta',
    caption: 'Pagi berkabut yang pelan di perbukitan, tempat segala perjalanan panjang bermula.',
    dateLabel: 'Arsip 01, Perjalanan',
    category: 'Perjalanan',
    aspect: '16/10',
  },
  {
    id: 'arsip-02',
    src: '/src/assets/images/archive_quiet_coffee_1795494204809.jpg',
    alt: 'Secangkir kopi hitam keramik di samping buku catatan bersampul linen dan pena kuningan',
    caption: 'Meja pagi sebelum hari dimulai: minuman hangat, buku catatan, dan pikiran yang tenang.',
    dateLabel: 'Arsip 02, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-03',
    src: '/src/assets/images/archive_dusk_rain_1795494079075.jpg',
    alt: 'Tetesan hujan pada kaca jendela kayu saat senja dengan lampu jalan berpendar lembut',
    caption: 'Hujan senja yang membuat langkah melambat sejenak dan percakapan terasa lebih hangat.',
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
  config: 'monograf_dinda_config_v2',
  wishes: 'monograf_ulang_tahun_wishes_v1',
  theme: 'monograf_ulang_tahun_theme_v1',
} as const;
