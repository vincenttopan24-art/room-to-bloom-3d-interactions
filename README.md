# ROOM TO BLOOM — paket interaksi 3D

Paket React JSX mandiri untuk menambahkan interaksi pada aset ROOM TO BLOOM. Demo lokal disediakan untuk menguji tiap objek. Integrasi ke website Manus dilakukan pada sumber proyek host; paket ini tidak mengganti atau menerbitkan ulang website yang sudah ada.

## Menjalankan demo lokal

Gunakan Node.js 20.19+ atau 22.12+ yang didukung Vite 7.

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

Buka `http://127.0.0.1:4173`. Untuk pengembangan gunakan `npm run dev`. Setelah mengubah kode untuk mode preview, build ulang, hentikan server preview lama, lalu nyalakan lagi. Tidak perlu API key atau layanan berbayar. Audio dimulai melalui tindakan pengguna.

Untuk membuka satu objek langsung, gunakan `http://127.0.0.1:4173/?object=notebook`. Nilai `object`: `clock`, `notebook`, `cd`, `tea`, `tv`, `calendar`, `lamp`, `bin`. Di React, perilaku yang sama tersedia melalui prop `initialObject` pada `RoomToBloomDemo` atau `ObjectInteractionManager`.

## Yang disertakan

| Objek | Perilaku |
|---|---|
| Jam | Jarum panjang mengatur jam, pendek menit; timer studi/istirahat, pause/resume/reset, preset 25/5 dan 50/10 |
| Notebook | Sampul asli berputar di punggung, satu halaman/tugas, lembar bersegmen melengkung, teks muncul bertahap; antrean pergantian halaman berurutan termasuk penambahan tugas sekaligus |
| CD | Hanya bagian cakram yang berputar saat audio benar-benar playing; tujuh pilihan audio dengan OptionWheel |
| Cangkir | Uap partikel saat timer istirahat berjalan, memudar saat berhenti |
| TV | Form tugas langsung di layar; rekomendasi lokal atau adapter AI dari host; apply ruang, suara, cahaya |
| Kalender | Bulan/tahun/tanggal lokal perangkat, lingkaran hari ini, pembaruan tengah malam |
| Lampu | Slider 0 sunset hangat → 1 siang terang, mempertahankan ruang dan koordinat hotspot |
| Tempat sampah | Satu kertas per ID tugas selesai, remas, lempar/drag, cek lintasan masuk, retry jika meleset |

Satu objek aktif pada satu waktu; tutup atau Escape mengembalikan kamera. Kontrol HTML mendampingi gestur 3D. Provider menyimpan state lokal dan deadline timer, sementara audio menunggu izin pengguna setelah reload.

## Struktur dan integrasi

- `src/index.js`: ekspor paket; `src/RoomInteractions.jsx`: demo dan pengelola interaksi.
- `src/objects/`: komponen 3D; `src/controllers/`: kamera, audio, latar; `src/core/`: state, rig, aset, hotspot.
- `public/assets/`: GLB dan PNG asli, nama file dipertahankan.
- `public/audio/`: tujuh WAV sintetis asli, CC0; bukan rekaman alam atau musik komersial.
- `tests/`: test state, model, animasi, kontrol dan lifecycle; `docs/screenshots/`: bukti visual yang tersedia.

Mulai dari [panduan integrasi Manus](docs/INTEGRATION.md). Detail: [state dan timer](docs/STATE.md), [notebook](docs/NOTEBOOK.md), [audio](docs/AUDIO.md), [ruang/pencahayaan](docs/LIGHTING.md), [kalender](docs/CALENDAR.md).

Sumber website terbit dan API efek merobek/meremas lama tidak tersedia dalam repo aset. Sambungkan efek itu melalui event/callback dengan ID tugas yang stabil; jangan menghapus alur lama. Model asli tetap dipakai dengan salinan scene runtime; halaman/uap/kertas/kalender adalah lapisan tambahan. CC0 hanya berlaku pada audio sintetis dan generatornya; hak aset asli mengikuti pemilik/sumber aset. OptionWheel memakai kode asli [React Bits](https://reactbits.dev/components/option-wheel) dengan [MIT + Commons Clause](src/vendor/REACT-BITS-LICENSE.md); pertahankan pemberitahuan lisensi dan ikuti ketentuan distribusinya.

Hasil verifikasi final dicatat pada laporan penyerahan. [Pemeriksaan awal](docs/INSPECTION-ID.md) adalah catatan historis sebelum implementasi, bukan status terakhir.

[Hasil verifikasi](docs/VERIFICATION.md) · [Cara menguji](docs/TESTING.md) · [Batas integrasi](docs/LIMITATIONS.md).
