# Hasil verifikasi — 5 November 2026

Paket lokal ini sudah diimplementasikan dan diverifikasi. Website Manus yang terbit tidak diubah.

## Pemeriksaan otomatis

Perintah terakhir: `npm test` → **17 file, 79 test lulus**. `npm run build` → **lulus**, Vite 7.3.7. Server preview lama dihentikan, hasil build terbaru dijalankan ulang di `127.0.0.1:4173`, dan endpoint HTML/model/audio merespons HTTP 200. `npm run inspect` memeriksa kesepuluh GLB dan menghasilkan `docs/model-report.json`.

| Area | Bukti otomatis |
|---|---|
| Timer/state | Deadline timestamp; pause/resume/reset; kedaluwarsa setelah reload; validasi penyimpanan dan batas durasi; preset; identitas tugas/kertas |
| Jam | GLB asli; ray pointer down/move/up; jarum panjang → jam, pendek → menit; badan tidak bergerak; pointer capture dan kunci saat running |
| CD/audio | GLB asli; cakram bergerak hanya playing; badan diam; pause; media gagal/autoplay ditolak; perpindahan track bersamaan; resume setelah reload; cleanup |
| Notebook | Sampul/judul/ilustrasi asli; halaman bersegmen melengkung; maju/mundur; antrean navigasi cepat; penambahan task yang dibatch; snapshot teks; cleanup |
| Teh | Posisi partikel naik/melengkung; fade aktif/nonaktif; hanya fase break running; damping independen pembagian frame |
| TV | Rekomendasi deterministik; Apply ke state; respons AI lama diabaikan; snapshot state menyeberangi root DOM Html secara eksplisit |
| Kalender | Tahun kabisat, posisi hari, tengah malam lokal, kembali ke tab; lingkaran; bidang tanggal di depan tekstur March bawaan |
| Lampu | Semua path aset nyata; 0 sunset/1 daylight; pengaman pasangan tidak sejajar; snapshot bidang gambar/hotspot |
| Bin | GLB asli; lintasan lempar → binned; satu mesh per ID; meleset → retry; menutup saat terbang → kembali crumpled; swept collision dan radius |
| Antarmuka | CRUD subtask; kontrol timer; satu dialog; Escape tanpa WebGL; fokus OptionWheel tetap; audio StrictMode; CSS tidak mengubah tombol host |

Tooling renderer test mengeluarkan peringatan `Multiple instances of Three.js being imported` karena jalur ESM/CJS dalam lingkungan pengujian. Tidak ada test gagal; build browser menggunakan dependensi Three yang sama. Peringatan ini tidak disembunyikan.

## Pemeriksaan browser yang dilakukan

Browser membuka server hasil build, bukan hanya source/dev server. Screenshot tersimpan di `docs/screenshots/`.

- GLB jam tampil; custom 01:02:00 dimulai, countdown berkurang, Pause menjadi Resume. Drag diuji pada handler produksi dengan ray dan GLB asli melalui renderer test; drag fisik browser lintas perangkat tetap perlu QA host.
- Notebook dibuka, task utama ditulis, subtask ditambahkan sebagai halaman kedua, completion tersimpan, dan halaman mundur diuji. Tampilan desktop dan ponsel diperiksa.
- CD dapat Play/Pause dan memulihkan pilihan Rain Sounds setelah reload, lalu Resume berhasil. Pemutaran pengujian dihentikan setelah selesai.
- Start break mengubah fase/countdown menjadi 00:05:00; Pause menghentikan timer. Uap terhubung langsung ke fase ini.
- Form rekomendasi tampil di layar TV asli. Submit lewat keyboard menampilkan University Library/Rain Sounds; Apply mengubah data-room menjadi library dan opacity sunset menjadi .3 (70% daylight).
- Kalender menampilkan November 2026, Senin sebagai awal minggu, dan tanggal lokal 5 di lingkaran merah. Ilustrasi Bertie tetap terlihat.
- Lampu diatur ke 0% lewat Home dan 100% lewat End; pilihan University Library dipertahankan.
- Kertas dari satu subtask selesai diremas lalu dilempar; status berubah menjadi in flight dan 1 small win collected. Setelah reload, satu kertas tetap terlihat di dasar bin. Sudut kamera bin diangkat agar interior terlihat.
- Tampilan sempit dan desktop diperiksa; tidak ada lebar konten melampaui viewport pada pemeriksaan DOM (325 px dan 1066 px CSS). Ukuran override pengujian diminta 390×844 dan 1280×900; browser menggunakan skala tampilan perangkat. Override dikembalikan setelah pengujian.

Pengujian browser menemukan dan memperbaiki dua masalah yang tidak tampak pada tes awal: state TV hilang pada root Html terpisah, dan overlay kalender awalnya tertutup tekstur March GLB. Pemeriksaan log juga menemukan error saat fallback Html pemuatan dilepas; indikator pemuatan dipindahkan ke DOM dialog. Pemuatan jam, pemuatan TV, submit TV, dan penutupan melalui Escape diuji ulang pada build terakhir; log error build terakhir kosong.

## Belum diverifikasi di website Manus

Integrasi state/tugas pengguna asli, API efek robek/meremas lama, koordinat hotspot yang sudah dimiliki host, penyimpanan backend/multi-device, perangkat sentuh fisik, dan adapter AI host belum diuji karena source Manus tidak tersedia. Ini adalah batas integrasi, bukan klaim bahwa website terbit sudah diperbarui.

Final checks: all 28 copied model/image assets match their source SHA-256; both OptionWheel source files match the official registry retrieval. Calendar local-space regression is covered with rotated/scaled/translated parents; the last browser build was reopened and its new-build error log was empty.
