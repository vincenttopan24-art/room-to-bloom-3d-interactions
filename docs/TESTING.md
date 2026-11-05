# Menjalankan dan mengulang pengujian

```sh
npm ci
npm test
npm run inspect
npm run build
npm run preview -- --port 4173
```

Setelah build baru, hentikan preview lama (Ctrl+C pada terminalnya) lalu jalankan preview lagi. Buka http://127.0.0.1:4173 . Jangan menimpa progress pengguna produksi untuk menguji.

Tiap objek bisa dibuka langsung dengan `?object=clock`, `notebook`, `cd`, `tea`, `tv`, `calendar`, `lamp`, atau `bin`. Semua memakai state yang sama pada origin browser tersebut. Untuk sesi uji terpisah, gunakan profil browser uji, origin localhost yang berbeda, atau `providerProps={{storageKey:'room-bloom-qa'}}`.

1. Jam: drag jarum panjang dan pendek dua arah. Bandingkan nilai angka. Coba preset 25/5 dan 50/10, Start, Pause, Resume, Reset, reload saat berjalan. Deadline harus tetap sama. Untuk tes durasi cepat, jalankan provider dengan `limits={{minStudyMs:1000}}` dan `initial={{timer:{studyMs:1000,remainingMs:1000,breakMs:1000}}}`. Fase harus berpindah tanpa menghitung interval sebagai sumber waktu.
2. Teh: Start break; uap muncul perlahan. Pause/akhir break harus memudarkan uap. Buka teh sebelum break: tidak ada uap permanen.
3. TV: tulis tugas, submit Enter, lihat hasil pada layar. Apply lewat tombol/keyboard; periksa ruang/suara/cahaya. Ubah tugas saat AI async masih pending: hasil lama tidak boleh muncul.
4. Notebook: buka, isi task utama, tambah dua subtask cepat, tunggu dua putaran. Previous/Next, edit, complete, delete, close, reload. Sampul harus ikut judul/ilustrasi, bukan memutar seluruh buku.
5. CD: gunakan wheel dengan drag/scroll atau panah keyboard, Play/Pause/Resume/Stop. Cakram saja bergerak. Uji URL audio salah dan autoplay ditolak: pesan error dan retry, tanpa rotasi palsu.
6. Kalender: periksa tanggal lokal dan awal minggu Senin. Ubah tanggal hanya di lingkungan uji terisolasi atau pakai fake timers test. Midnight dan visibilitychange memiliki tes otomatis; jangan mengganti tanggal perangkat pengguna untuk QA.
7. Lampu: 0/50/100%, berpindah ruang, lalu ubah lagi. Posisi objek/hotspot harus tetap sama dalam setiap pasangan.
8. Bin: complete satu subtask, crumple, drag/throw. Uji meleset dan retry. Binned count dan paper meshes harus sama; reload mempertahankan hasil. Tutup saat terbang: paper dapat dicoba lagi.
9. Semua dialog: Escape, close, fokus keyboard, viewport sempit; periksa console, jumlah Canvas, dan pemutaran audio. React StrictMode pada dev harus tetap dapat memutar audio.

Lihat VERIFICATION.md untuk pemeriksaan yang sudah dilakukan pada paket ini dan LIMITATIONS.md untuk QA yang masih menjadi tanggung jawab integrasi Manus.
