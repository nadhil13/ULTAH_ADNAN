# DESIGN.md: Monograf Ulang Tahun ke-22 Dinda Hendra Putri

## Identity & Mood
- **Subject**: Perayaan 22 tahun Dinda Hendra Putri (lahir di Sungai Sirah, 24 November 2004).
- **Visual Language**: Diorama cat air dan gouache arsip Minangkabau (Bukit Barisan, Rumah Gadang beratap gonjong, Rangkiang, aliran Sungai Sirah, dan kanopi botani cempaka/kamelia) yang bertransformasi dari fajar pagi hingga senja berbintang dan taman lentera malam.
- **Dial**: `ENERGY 3 / RHYTHM 3 / MOTION 3`

## Palette (2 Core Neutrals + 1 Deliberate Accent, R-29)
- **Light Mode (Porcelain & Archival Cotton)**:
  - Canvas Paper: `#FAF8F4` (`rgba(250, 248, 244, 0.89)` untuk panel baca di atas diorama)
  - Tactile Linen Surface: `#EFECE4`
  - Primary Ink: `#16191E`
  - Secondary Muted Ink: `#48515B`
  - Deliberate Accent (Minang Claret / Songket Maroon): `#7D223C` (teks di atas aksen: `#FAF8F4`)
- **Evening Dark Mode (Starlit Nocturne)**:
  - Canvas Slate: `#13161B` (`rgba(22, 26, 31, 0.89)` untuk panel baca)
  - Elevated Nocturne Surface: `#1C2128`
  - Primary Ink: `#F4F3EE`
  - Secondary Muted Ink: `#A9B2BC`
  - Deliberate Accent (Rose Silk): `#E8A3B5` (teks di atas aksen: `#13161B`)
- **Section 6 Twilight Dusk Stage (`#lilin`, berlaku di kedua tema)**:
  - Twilight Velvet Panel: `rgba(21, 19, 32, 0.88)` di atas langit senja indigo-burgundy `#1A1626`
  - Twilight Ink: `#F6F4EF` (>14:1 kontras)
  - Twilight Muted Ink: `#C7C1D6` (>8.5:1 kontras)
  - Twilight Accent: `#F0B27A` & `#EAA4B6`

## Typography (R-06)
- **Display & Editorial Headings**: `Fraunces` (optical-size serif) dipilih agar judul bab, nama penerima, dan salam pembuka surat memiliki kehangatan cetakan buku monograf fisik.
- **Body & Interface Controls**: `Plus Jakarta Sans` dipilih karena keterbacaan tinggi untuk bahasa Indonesia pada label kontrol, keterangan arsip, dan formulir buku ucapan.

## Written Purpose Justifications (R-31)
1. **Color & Scenic Gradients (R-01)**: Gradien atmosferik per bagian merepresentasikan perjalanan waktu sehari penuh di lembah Sungai Sirah (pagi berkabut, siang jernih, sore keemasan, senja lilin, hingga malam lentera) sebagai penanda hierarki naratif tujuh bab.
2. **Layout & Section Rhythm (R-05)**: Tujuh bagian memakai komposisi berbeda sesuai kebutuhan konten: sampul singkap penuh, dedikasi kata demi kata tersemat, empat babak asimetris bergantian, rel galeri horizontal + strip rekaman vertikal 9:16 + lembar kontak koleksi, amplop surat bersegel lilin, panggung tiup lilin senja dengan kartu kejutan PNG, serta buku tamu dua kolom.
3. **Paper Texture & Songket Watermark (R-07)**: Serat kertas kapas `<feTurbulence>` (`opacity: 0.035`) dan garis tipis tenun songket/botani (`opacity: 0.08`) menghubungkan halaman digital langsung dengan budaya Sumatera Barat tempat kelahiran Dinda.
4. **Icons (R-04)**: Ikon garis hanya dipakai pada kontrol fungsional (putar/jeda audio, volume, tema terang/gelap, unggah berkas, tiup/nyalakan lilin, pratinjau/tutup galeri) untuk memperjelas aksi tombol tanpa emoji dekoratif.
5. **Glassmorphism, Shadow & Glow Dose Caps (R-10, R-12, R-13)**: Efek blur hanya dipakai pada bilah navigasi saat digulir; bayangan terangkat hanya dipakai pada lembar surat terbuka, kartu kejutan, dan dialog modal; pendar cahaya hanya dipakai pada nyala api lilin ulang tahun serta jendela lentera Rumah Gadang saat senja.
6. **Motion & Scrub Choreography (R-19)**: Animasi GSAP ScrollTrigger dua arah (`scrub: 0.7`) memandu transisi suasana langit, paralaks pegunungan Bukit Barisan, pembukaan tirai bunga, dan sorotan kata dedikasi saat pengguna menggulir naik maupun turun, dengan dukungan penuh `prefers-reduced-motion`.
7. **Illustrations & Real Media (R-22, R-23)**: Ilustrasi Rumah Gadang dan lembah Sungai Sirah merujuk langsung pada tanah kelahiran Dinda, dipadukan dengan 38 foto asli dan 4 video vertikal asli milik Dinda dan orang terdekatnya di folder `/img`.
