# Kalender tanggal lokal

`Calendar({assetBase})` memuat `calendar.glb` melalui `usePreparedModel` dan merendernya dengan `InteractiveGLB`. Model asli, material, dan ilustrasi bagian atas tetap dipakai. Hanya bagian tanggal March statis ditutup bidang kalender dinamis berukuran 3,68 × 3,13 pada posisi model `[0, 0.125, 1.66]`, di atas pad asli. Seluruh model diputar `Math.PI/2` pada sumbu X untuk menghadap kamera.

Kalender membaca `new Date()` dari perangkat pengguna: bulan, tahun, hari, dan hari ini tidak dikunci ke contoh tanggal. Tata letak dimulai Senin; tahun kabisat mengikuti kalender JavaScript. Tanggal hari ini diberi latar hangat dan lingkaran merah yang digambar selama satu detik pertama. Perubahan tanggal memulai ulang animasi ini.

Pembaruan dijadwalkan pada tengah malam **waktu lokal berikutnya**, memakai tanggal kalender berikutnya, bukan menambahkan 24 jam tetap. Ini mempertahankan perilaku saat pergantian tahun, bulan, dan perubahan durasi hari karena daylight saving. Saat tab kembali terlihat, tanggal langsung diperiksa lagi; timer dijadwalkan ulang. Timer, listener `visibilitychange`, dan CanvasTexture dibersihkan ketika komponen dilepas.

Helper yang diekspor untuk test:

- `calendarLayout(date = new Date())`: memakai `calendarMonth` bersama, menambahkan koordinat angka, baris, dan kolom.
- `millisecondsUntilLocalMidnight(date = new Date())`: waktu tunggu menuju pukul 00:00 lokal berikutnya.
- `watchLocalDate(onDate, target = document)`: memberi tanggal sekarang, pembaruan tengah malam/visibility; mengembalikan fungsi cleanup.
- `drawCalendar(ctx, month, progress = 1)`: menggambar label dan lingkaran ke Canvas2D; `progress` 0–1 mengatur bagian lingkaran yang terlihat.

Jalankan `npx vitest run tests/calendar.test.jsx`. Test memeriksa Februari kabisat, 2100 bukan kabisat, November aktual contoh sistem, kolom Senin–Minggu, ganti tahun saat tengah malam, pemeriksaan saat tab kembali terlihat, cleanup, dan gerak lingkaran. Canvas2D diuji melalui konteks gambar tiruan agar tidak bergantung dukungan canvas jsdom. Pemeriksaan posisi model dan tekstur akhir dilakukan pada browser demo terintegrasi.
