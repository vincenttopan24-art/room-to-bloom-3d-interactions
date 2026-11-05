# ROOM TO BLOOM — pemeriksaan awal

Tanggal: 5 November 2026. Pemeriksaan struktur biner GLB; belum ada implementasi atau uji animasi.

Repo: https://github.com/clarinetopan-collab/Room-bloom-2
Commit main saat diperiksa: a29b6c0c93227e0e3dbebde2855db4a1cf824a2e
Aset diunduh lewat arsip main. Workspace awal kosong; tidak ada CLAUDE.md atau sumber website. README repo hanya deskripsi aset. Akses connector: pull=true, push=false.

## Inventaris GLB

| File pada root repo | Node | Mesh | Material | Klip animasi |
|---|---:|---:|---:|---:|
| `3D model island.glb` | 887 | 887 | 33 | 0 |
| `CD.glb` | 387 | 386 | 14 | 0 |
| `TV.glb` | 19 | 19 | 11 | 0 |
| `alarm_clock.glb` | 97 | 97 | 7 | 0 |
| `book_stack.glb` | 411 | 405 | 15 | 0 |
| `calendar.glb` | 13 | 13 | 6 | 0 |
| `planning_book_3d.glb` | 149 | 149 | 10 | 0 |
| `red table lamp.glb` | 30 | 30 | 9 | 0 |
| `rubbish can.glb` | 203 | 203 | 9 | 0 |
| `tea cup.glb` | 49 | 49 | 10 | 0 |

## Temuan dan rencana penanganan

- Semua model memiliki mesh terpisah. Tidak ada klip animasi bawaan. Material, transformasi node, batas posisi mesh, dan hierarki tersimpan di glb-inspection.json. Kalibrasi visual tetap diperlukan.
- CD: grup `CD_ROTATION_ROOT - animate this` pada [0, 3.36, 0] hanya menaungi `RAISED CD - actual 3D disc`. Ilustrasi CD dan komponen pusat berada di luar grup. Perlu menentukan bagian yang ikut berputar agar gambar tidak diam. Kandidat sumbu cakram: Z model; wajib diverifikasi visual.
- Jam: `Hour Hand`, `Minute Hand`, `Second Hand`, `Clock Center Pin` terpisah. Origin jarum bukan pusat bersama. Tambahkan grup pivot di pin dengan transformasi dunia dipertahankan. Jarum panjang mengatur jam, pendek mengatur menit sesuai brief; panjang ditentukan dari geometri, bukan nama konvensional.
- Notebook: `Top Royal Blue Hardcover`, judul, ilustrasi sampul, dan `Rounded Blue Book Spine` terpisah. `Thick Cream Paper Block` dan garis sisi adalah blok statis, bukan halaman lentur. Tambah mesh halaman bersegmen dan deformasi; grupkan dekorasi bersama sampul.
- TV: `Black Recessed Screen Cavity` dan bezel terpisah. Pasang antarmuka pada bidang layar dan uji keterbacaan/penutupan oleh bezel.
- Kalender: `White March Calendar Pad` statis dan empat `Individual Paper Sheet` tersedia. Ganti area kalender dengan tekstur tanggal lokal; jangan mempertahankan bulan March bawaan.
- Cangkir: `Amber Tea Liquid Surface` terpisah. Emisi uap di atas permukaan; uap terhubung fase istirahat dan memudar setelah selesai.
- Tempat sampah: `01 - Hollow tapered cream bucket` tersedia. Penampungan kertas harus memakai batas interior, radius kertas, dan titik pendaratan, bukan hanya batas kotak luar. Riwayat tugas menjadi sumber kertas.
- Beberapa model memuat studio floor besar. Sembunyikan hanya node lantai yang teridentifikasi pada salinan scene runtime sebelum menghitung framing kamera, tanpa mengubah GLB asli.

## Kandidat pasangan gambar

| Ruang | Siang | Senja |
|---|---|---|
| Beach | `Beachside.png` | `beachside sunset.png` |
| Colourful Study Room | `Colourful study room.png` | `colorful study room Sunset Light.png` |
| Living Room | `Living Room.png` | `living room sunset.png` |
| Botanical Garden | `botanical garden.png` | `botanical garden sunset.png` |
| Local Park — perlu konfirmasi visual | `local park.png` | `local garden sunset.png` |
| Rooftop | `rooftop.png` | `rooftop sunset.png` |
| University Café | `university cafe.png` | `university cafe sunset.png` |
| University Classroom | `university classroom.png` | `university classroom sunset.png` |
| University Library | `university libary.png` | `university libary sunset.png` |

Ukuran berkas PNG:
- `Beachside.png`: 1670 × 941
- `Colourful study room.png`: 1670 × 941
- `Living Room.png`: 1670 × 942
- `beachside sunset.png`: 1670 × 942
- `botanical garden sunset.png`: 1670 × 942
- `botanical garden.png`: 1670 × 942
- `colorful study room Sunset Light.png`: 1670 × 942
- `living room sunset.png`: 1670 × 942
- `local garden sunset.png`: 1670 × 942
- `local park.png`: 1670 × 941
- `rooftop sunset.png`: 1472 × 1068
- `rooftop.png`: 1472 × 1068
- `university cafe sunset.png`: 1672 × 941
- `university cafe.png`: 1672 × 941
- `university classroom sunset.png`: 1670 × 942
- `university classroom.png`: 1670 × 941
- `university libary sunset.png`: 1670 × 942
- `university libary.png`: 1670 × 941

Kesamaan komposisi seluruh pasangan belum diverifikasi. Ukuran sama tidak membuktikan posisi objek sama. Hindari mengaktifkan crossfade sampai landmark/hotspot diperiksa. Nama local park/local garden tidak membuktikan bahwa keduanya satu ruangan.

## Referensi dan dependensi yang ditemukan

- OptionWheel JS-CSS resmi berhasil diambil dari https://reactbits.dev/r/OptionWheel-JS-CSS.json (OptionWheel.jsx dan OptionWheel.css). Belum diintegrasikan atau diuji. Tidak perlu membuat pengganti select.
- Situs terbit dapat dibuka: landing, map, dan pilihan Home terlihat. Sesudah galeri Home dimuat, browser menampilkan halaman kosong; penyebab belum diperiksa. Interaksi meja, merobek, dan meremas belum diverifikasi.
- Sumber kode website tidak tersedia di repo aset. Bundle publik bukan pengganti sumber proyek Manus. Integrasi wajib melalui kontrak state/callback yang disesuaikan Manus.
- Repo tidak menyertakan file audio. Sumber audio dan lisensinya perlu dipilih dan diverifikasi; jangan mengklaim tujuh kategori sudah dapat diputar.

## Rancangan yang diajukan untuk persetujuan

Paket mandiri `room-to-bloom-3d-interactions/`, React JSX + Three.js + React Three Fiber + Drei, demo lokal terpisah. Tidak mengganti situs terbit.

Satu provider menyimpan timer, audio, tugas, ruang, pencahayaan, dan objek aktif. Komponen objek membaca state bersama; callback menghubungkan state dengan Manus. Aset asli dimuat sebagai salinan scene sehingga perubahan runtime tidak merusak cache bersama.

Timer menggunakan timestamp, bukan pengurangan tiap interval. Penyimpanan lokal memakai versi skema. Tugas dan kertas memakai ID stabil, satu kertas per riwayat tugas selesai. Satu pengendali kamera menyimpan posisi awal, fokus, Escape, dan kembali.

Alternatif: komponen tanpa demo lebih kecil tetapi sulit diverifikasi; integrasi langsung ke website memerlukan sumber Manus. Paket dengan demo adalah pilihan yang direkomendasikan.

Verifikasi yang direncanakan: TDD untuk logika timer/sudut/kalender/state/lemparan; full suite; build; restart server demo; hit endpoint; uji browser interaksi sebenarnya dan screenshot. Hasil akhir menyebut mana teruji di demo dan mana menunggu integrasi Manus.

## Status

Pemeriksaan struktur aset selesai; kalibrasi visual model, implementasi, test, build, dan demo belum dilakukan. Ini bukan paket kode final. Menunggu persetujuan rancangan fitur baru sesuai AGENTS.md Vincent.
