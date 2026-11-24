export type ArchiveCategory =
  | 'Semua'
  | 'Bersama'
  | 'Perjalanan'
  | 'Momen Kecil'
  | 'Rekaman';

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
  aspect: '4/5' | '16/10' | '1/1' | '4/3' | '9/16';
  mediaType?: 'image' | 'video';
  featured?: boolean;
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
  youtubeVideoId: string;
  customAudioName: string | null;
}

export interface WishEntry {
  id: string;
  name: string;
  relation: string;
  message: string;
  createdAt: string;
}

export const DEFAULT_YOUTUBE_VIDEO_ID = 'koZK67e1C-U';
export const DEFAULT_YOUTUBE_TRACK_TITLE = 'Cinta Terakhir, Ari Lasso';

export const DEFAULT_PORTRAIT_IMAGE = '/img/17.jpeg';

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  celebrantName: 'Dinda Hendra Putri',
  turningAge: '22',
  birthplace: 'Sungai Sirah',
  birthdate: '2004-11-24',
  senderName: 'Adnan',
  coverHeaderLine: 'Untuk merayakan dua puluh dua tahun',
  coverSubtitle: 'Merayakan dua puluh dua tahun perjalanan',
  heroOpeningLine:
    'Sebuah lembaran tenang untuk merayakan dua puluh dua tahun perjalananmu sejak Sungai Sirah, menyimpan kenangan kecil yang nyata, dan mengirim doa terbaik bagi langkahmu berikutnya.',
  portraitUrl: DEFAULT_PORTRAIT_IMAGE,
  portraitCaption: 'Jeda sore yang teduh di hamparan rumput hijau, edisi ulang tahun ke 22.',
  dedicationParagraph:
    'Dua puluh dua tahun sejak pagi pertama di Sungai Sirah bukan sekadar deretan angka di kalender, melainkan jejak ketekunan, kelembutan, dan keberanianmu bertumbuh menjadi diri sendiri. Semoga tahun baru dalam usiamu ini selalu memberimu ruang lebih luas untuk bernapas, waktu yang cukup bagi hal yang benar benar berarti, serta langkah yang teduh di mana pun kamu berada.',
  dedicationClosingPhrase:
    'Terima kasih sudah bertumbuh sejauh ini dengan hati yang hangat dan jujur, Dinda.',
  letterSalutation: 'Untuk Dinda Hendra Putri,',
  letterBody: [
    'Halo cantiknya abg, selamat ulang tahun yaaa cantik, di umur kamu yang udah 22 tahun semoga apa yang kamu impikan dan yang pengen kamu lakuin bisa tercapai semua ya.',
    'Doa abg ke kamu semoga kamu sehat selalu, selalu d mudahkan rezeki nya, dan semoga kamu wisuda di april ini.',
    'Oh iya pesen abg egonya di turunin lagi yaa, dan semoga kedepannya kamu lebih bisa dengerin omongan aku, jangan udah apa apa dlu baru di bilang.',
    'Makasih y udah sama abg sejauh ini, makasih udah baik sama aku, makasih yaa.',
    'Selamat ulang tahun cantiknya akuuu 🖤\nlove youuuuuu banyak banyak',
  ],
  letterClosing: 'Dari abg,',
  surpriseTitle: 'Kupon Makan Malam dan Jalan Jalan Pilihan Dinda',
  surpriseSubtitle: 'Berlaku kapan saja sepanjang usia 22 tahun',
  surpriseNote:
    'Pilih tempat makan favorit, kedai kopi yang ingin disinggahi, atau perjalanan sore yang tenang bersama. Tunjukkan kartu ini kapan pun kamu ingin menukarkannya.',
  youtubeVideoId: DEFAULT_YOUTUBE_VIDEO_ID,
  customAudioName: null,
};

export const CHAPTERS_DATA: ChapterItem[] = [
  {
    id: 'babak-01',
    index: '01',
    period: 'Akar di Sungai Sirah',
    title: 'Langkah Pertama dari Rumah yang Hangat',
    summary:
      'Setiap kebaikan yang tumbuh dalam dirimu hari ini berawal dari hari hari sederhana di halaman rumah. Dari rasa syukur yang tulus hingga kehangatan keluarga yang mengajarkan arti pulang.',
    note: 'Akar yang tenang selalu memberi kekuatan pada ranting yang tumbuh tinggi.',
    plateSrc: '/img/16.jpeg',
    plateAlt: 'Dinda mengenakan busana putih di halaman rumah yang teduh',
    plateCaption: 'Halaman rumah yang selalu menjadi tempat kembali dengan hati ringan',
    layoutVariant: 'wide-offset',
  },
  {
    id: 'babak-02',
    index: '02',
    period: 'Masa Bertumbuh',
    title: 'Menemukan Irama Sendiri di Ruang Belajar',
    summary:
      'Memasuki bangku kuliah dan praktik lapangan membawa banyak pengalaman baru. Di fase ini, kamu belajar berdiri percaya diri, menimba ilmu dengan tekun, dan merayakan setiap kemajuan kecil.',
    note: 'Keputusan kecil yang dijalani dengan sungguh sungguh selalu membuka jalan baru.',
    plateSrc: '/img/40.jpeg',
    plateAlt: 'Dinda mengenakan toga praktik persidangan sambil tersenyum memegang palu sidang',
    plateCaption: 'Langkah belajar dan praktik lapangan di Pengadilan Agama Pariaman',
    layoutVariant: 'split-caption',
  },
  {
    id: 'babak-03',
    index: '03',
    period: 'Jeda yang Jujur',
    title: 'Merawat Sore Teduh yang Membuat Hati Utuh',
    summary:
      'Di sela kesibukan, kamu membuktikan bahwa beristirahat sejenak bukanlah tanda berhenti. Angin pantai saat matahari merendah, tawa ringan di meja makan, dan percakapan tanpa tergesa selalu cukup untuk mengisi ulang tenaga.',
    note: 'Ketekunan yang paling tahan lama selalu berjalan beriringan dengan ketenangan.',
    plateSrc: '/img/18.jpeg',
    plateAlt: 'Dinda duduk santai di atas pasir pantai dengan cahaya matahari sore yang hangat',
    plateCaption: 'Cahaya keemasan di tepi pantai menjelang senja',
    layoutVariant: 'quote-highlight',
  },
  {
    id: 'babak-04',
    index: '04',
    period: 'Menyambut Usia 22',
    title: 'Membuka Lembaran Baru dengan Doa dan Syukur',
    summary:
      'Dua puluh dua tahun membuka halaman yang masih bersih dan penuh harapan baik. Semoga kamu terus melangkah dengan hati lapang, tetap rendah hati saat berhasil, dan selalu dikelilingi kasih yang tulus.',
    note: 'Babak usia 22 tahun resmi dimulai pada 24 November 2026.',
    plateSrc: '/img/19.jpeg',
    plateAlt: 'Momen kebersamaan memegang kue ulang tahun dalam balutan busana senada hangat',
    plateCaption: 'Sepotong kue dan doa hangat untuk menyambut tahun yang baru',
    layoutVariant: 'closing-folio',
  },
];

export const DEFAULT_ARCHIVE_PHOTOS: ArchivePhoto[] = [
  // Featured Showcase Highlights (Curated Horizontal Rail + Category Collections)
  {
    id: 'arsip-19',
    src: '/img/19.jpeg',
    alt: 'Momen merayakan ulang tahun bersama kue cokelat dalam kemeja krem senada',
    caption: 'Kue ulang tahun dan senyum hangat dalam balutan warna senada.',
    dateLabel: 'Arsip Pilihan, Bersama',
    category: 'Bersama',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-08',
    src: '/img/8.jpeg',
    alt: 'Saling bertatapan hangat di padang rumput berlatar pohon kelapa dan langit senja',
    caption: 'Langit sore berawan keemasan dan tatapan teduh di tepi lapangan hijau.',
    dateLabel: 'Arsip Pilihan, Bersama',
    category: 'Bersama',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-30',
    src: '/img/30.jpeg',
    alt: 'Berfoto bersama di depan bus Pesona Tanah Minang di bawah pepohonan rindang',
    caption: 'Singgah sejenak sebelum perjalanan bersama Pesona Tanah Minang.',
    dateLabel: 'Arsip Pilihan, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-39',
    src: '/img/39.jpeg',
    alt: 'Bingkai polaroid potret Dinda di tepi pantai saat langit biru senja',
    caption: 'Lembar polaroid biru senja di tepi ombak malam yang tenang.',
    dateLabel: 'Arsip Pilihan, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-26',
    src: '/img/26.jpeg',
    alt: 'Potret studio berdampingan mengenakan jas almamater kuning dan biru',
    caption: 'Potret studio mengenakan jas almamater kebanggaan masa kuliah.',
    dateLabel: 'Arsip Pilihan, Bersama',
    category: 'Bersama',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-21',
    src: '/img/21.jpeg',
    alt: 'Tawa lepas yang tertangkap kamera saat duduk berdua di meja kayu kafe',
    caption: 'Tawa jujur tanpa dibuat buat di sela obrolan meja makan.',
    dateLabel: 'Arsip Pilihan, Bersama',
    category: 'Bersama',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-15',
    src: '/img/15.jpeg',
    alt: 'Berdiri bersama di tribun stadion malam mengenakan syal Kabau Sirah',
    caption: 'Malam penuh semangat di tribun stadion berlatar atap gonjong.',
    dateLabel: 'Arsip Pilihan, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-38',
    src: '/img/38.jpeg',
    alt: 'Potret cermin kayu Dinda mengenakan batik sambil memegang balon putih',
    caption: 'Cermin kayu dan balon putih di sela hari praktik lapangan.',
    dateLabel: 'Arsip Pilihan, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-09',
    src: '/img/9.jpeg',
    alt: 'Swafoto hangat di hamparan pasir pantai berlatar pohon kelapa',
    caption: 'Angin laut dan ketenangan sore di pesisir pantai.',
    dateLabel: 'Arsip Pilihan, Bersama',
    category: 'Bersama',
    aspect: '4/5',
    featured: true,
  },
  {
    id: 'arsip-34',
    src: '/img/34.jpeg',
    alt: 'Dinda berpose dua jari di pantai saat gradasi senja ungu kemerahan',
    caption: 'Garis cakrawala ungu kemerahan saat senja turun perlahan di laut.',
    dateLabel: 'Arsip Pilihan, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
    featured: true,
  },

  // 4 Living Vertical Video Reels (22.mp4 - 25.mp4)
  {
    id: 'video-22',
    src: '/img/22.mp4',
    alt: 'Rekaman video kenangan Dinda bagian pertama',
    caption: 'Potongan gerak dan tawa hangat yang terekam utuh apa adanya.',
    dateLabel: 'Rekaman 01, Video Kenangan',
    category: 'Rekaman',
    aspect: '9/16',
    mediaType: 'video',
  },
  {
    id: 'video-23',
    src: '/img/23.mp4',
    alt: 'Rekaman video kenangan Dinda bagian kedua',
    caption: 'Detik detik sederhana yang selalu menyenangkan ketika diputar ulang.',
    dateLabel: 'Rekaman 02, Video Kenangan',
    category: 'Rekaman',
    aspect: '9/16',
    mediaType: 'video',
  },
  {
    id: 'video-24',
    src: '/img/24.mp4',
    alt: 'Rekaman video kenangan Dinda bagian ketiga resolusi penuh',
    caption: 'Jejak perjalanan dan suasana akrab yang tersimpan dalam bingkai bergerak.',
    dateLabel: 'Rekaman 03, Video Kenangan',
    category: 'Rekaman',
    aspect: '9/16',
    mediaType: 'video',
  },
  {
    id: 'video-25',
    src: '/img/25.mp4',
    alt: 'Rekaman video kenangan Dinda bagian keempat',
    caption: 'Sepenggal cerita sore untuk dikenang kembali di usia dua puluh dua.',
    dateLabel: 'Rekaman 04, Video Kenangan',
    category: 'Rekaman',
    aspect: '9/16',
    mediaType: 'video',
  },

  // Complete Contact-Sheet Photo Archive (Remaining Real Photos from /img)
  {
    id: 'arsip-01',
    src: '/img/1.jpeg',
    alt: 'Berfoto berdampingan di ruang makan bersekat keemasan dengan kemeja krem senada',
    caption: 'Sore yang rapi dalam balutan kemeja senada.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-02',
    src: '/img/2.jpeg',
    alt: 'Senyum hangat berdampingan di samping meja makan kayu',
    caption: 'Satu bingkai lagi dari makan malam hangat berdua.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-03',
    src: '/img/3.jpeg',
    alt: 'Duduk berdampingan di meja kayu kafe dengan suasana terang',
    caption: 'Meja kayu dan jeda berbincang santai selepas aktivitas.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-04',
    src: '/img/4.jpeg',
    alt: 'Swafoto sebelum berangkat dengan tas ransel di atas motor',
    caption: 'Persiapan berangkat di teras sebelum menempuh perjalanan.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-05',
    src: '/img/5.jpeg',
    alt: 'Swafoto jarak dekat Dinda mengenakan kerudung abu muda dan kemeja biru lembut',
    caption: 'Potret pagi sebelum memulai kegiatan hari itu.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-06',
    src: '/img/6.jpeg',
    alt: 'Potret Dinda tersenyum lembut mengenakan seragam biru tua berbordir nama',
    caption: 'Senyum tenang sebelum melangkah ke ruang kegiatan.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-07',
    src: '/img/7.jpeg',
    alt: 'Berdiri bersama di tepi lapangan hijau dengan awan senja lembut',
    caption: 'Sore cerah berangin dengan deretan pohon kelapa di kejauhan.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-10',
    src: '/img/10.jpeg',
    alt: 'Swafoto di dekat skuter klasik hitam di tepi taman kota',
    caption: 'Berhenti sejenak di sisi taman bersama skuter klasik.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-11',
    src: '/img/11.jpeg',
    alt: 'Potret Dinda di depan pintu kayu rumah dengan cahaya pagi alami',
    caption: 'Cahaya pagi yang jatuh lembut di depan pintu kayu.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-12',
    src: '/img/12.jpeg',
    alt: 'Tampak belakang merangkul bahu menghadap lapangan stadion yang terang benderang',
    caption: 'Menatap lampu sorot lapangan hijau dari balik pagar tribun.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-13',
    src: '/img/13.jpeg',
    alt: 'Tertawa saling menoleh di tangga tribun stadion malam',
    caption: 'Tawa kecil di tengah riuh suasana pertandingan malam.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-14',
    src: '/img/14.jpeg',
    alt: 'Berdampingan menghadap rumput stadion di bawah sorot lampu malam',
    caption: 'Menyaksikan babak demi babak pertandingan bersama.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-16',
    src: '/img/16.jpeg',
    alt: 'Dinda merentangkan tangan ceria mengenakan gamis putih di halaman rumah',
    caption: 'Halaman rumah yang teduh dengan senyum ringan.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-17',
    src: '/img/17.jpeg',
    alt: 'Dinda duduk memandang kejauhan di atas rumput hijau yang hangat',
    caption: 'Duduk santai menikmati udara sore di atas hamparan rumput.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-18',
    src: '/img/18.jpeg',
    alt: 'Dinda menopang dagu sambil tersenyum di atas pasir pantai sore hari',
    caption: 'Bayangan panjang matahari sore di atas pasir pantai.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-20',
    src: '/img/20.jpeg',
    alt: 'Kolase empat bingkai swafoto mengenakan helm di bawah pohon kelapa',
    caption: 'Empat ekspresi jenaka berhelm di bawah langit biru cerah.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-27',
    src: '/img/27.jpeg',
    alt: 'Momen candid tertawa di studio foto sambil memanggul tripod kamera',
    caption: 'Di balik layar sesi foto studio yang penuh tawa.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-28',
    src: '/img/28.jpeg',
    alt: 'Dinda tertawa menutup mulut saat sesi foto studio berjas almamater',
    caption: 'Ekspresi spontan yang tertangkap di sela pemotretan studio.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-29',
    src: '/img/29.jpeg',
    alt: 'Dinda mengacungkan jempol sambil memegang minuman segar di tepi pantai sore',
    caption: 'Minuman dingin dan angin sore di tepi muara pantai.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-31',
    src: '/img/31.jpeg',
    alt: 'Tersenyum lebar berdiri bersama di depan bus pariwisata Sumatera Barat',
    caption: 'Cerah pagi sebelum roda perjalanan kembali berputar.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-32',
    src: '/img/32.jpeg',
    alt: 'Bersandar hangat di depan bus Pesona Tanah Minang',
    caption: 'Kenangan perjalanan darat di bawah langit pagi yang bersih.',
    dateLabel: 'Lembar Arsip, Bersama',
    category: 'Bersama',
    aspect: '4/5',
  },
  {
    id: 'arsip-33',
    src: '/img/33.jpeg',
    alt: 'Dinda berpose jenaka saat menikmati minuman malam di bangku tepi jalan',
    caption: 'Jajan malam sederhana dan pose jenaka yang menghangatkan suasana.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-35',
    src: '/img/35.jpeg',
    alt: 'Swafoto dekat ekspresi mengantuk yang dikirim sebagai candaan harian',
    caption: 'Kiriman swafoto candaan pengingat hari hari biasa.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-36',
    src: '/img/36.jpeg',
    alt: 'Dinda mengenakan helm dengan pose cakar jenaka di malam hari',
    caption: 'Ekspresi ceria berhelm sebelum pulang menembus angin malam.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-37',
    src: '/img/37.jpeg',
    alt: 'Momen candid menikmati sepiring makan siang rumahan dengan lahap',
    caption: 'Makan siang rumahan sederhana yang terekam tanpa sadar.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-40',
    src: '/img/40.jpeg',
    alt: 'Dinda mengenakan toga hijau hitam hakim sembari memegang palu sidang',
    caption: 'Kenangan berharga mengenakan toga di ruang sidang praktik.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
  {
    id: 'arsip-41',
    src: '/img/41.jpeg',
    alt: 'Swafoto cermin Dinda memegang balon putih mengenakan batik',
    caption: 'Satu sudut cermin lagi bersama balon putih di kantor praktik.',
    dateLabel: 'Lembar Arsip, Momen Kecil',
    category: 'Momen Kecil',
    aspect: '4/5',
  },
  {
    id: 'arsip-42',
    src: '/img/42.jpeg',
    alt: 'Bingkai polaroid Dinda berkacak pinggang ceria di tepi pantai malam',
    caption: 'Lembar polaroid kedua dengan latar birunya laut senja.',
    dateLabel: 'Lembar Arsip, Perjalanan',
    category: 'Perjalanan',
    aspect: '4/5',
  },
];

export const ARCHIVE_CATEGORIES: ArchiveCategory[] = [
  'Semua',
  'Bersama',
  'Perjalanan',
  'Momen Kecil',
  'Rekaman',
];

export const STORAGE_KEYS = {
  config: 'monograf_dinda_config_v4',
  wishes: 'monograf_ulang_tahun_wishes_v1',
  theme: 'monograf_ulang_tahun_theme_v1',
} as const;
