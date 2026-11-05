# Audio

`AudioController` tidak tergantung React atau penyimpanan aplikasi.

```js
import { AudioController, DEFAULT_TRACKS } from './src/controllers/AudioController.js';
const audio = new AudioController({
  tracks: DEFAULT_TRACKS,
  onStateChange: state => console.log(state),
});
// Panggil di event klik/tap pengguna, agar browser mengizinkan suara.
await audio.play(0);
audio.setVolume(0.4);
audio.pause();
await audio.resume();
audio.stop();
audio.dispose(); // saat komponen dilepas
```

Constructor menerima `{tracks, onStateChange, AudioClass}`; `AudioClass` default `globalThis.Audio` dan dapat diganti saat test. Track berupa `{label, src, license, attribution}`. `play(index)` dan `resume()` mengembalikan Promise boolean: true jika pemutaran berhasil; false jika gagal atau sudah diganti/dibatalkan. `pause`, `stop`, `setVolume`, `dispose` tidak mengembalikan hasil. Volume harus angka terbatas 0–1; selain itu melempar RangeError. Volume awal 0,5.

Callback menerima `{track, status, error?}`; `track` adalah indeks pilihan (null sebelum pilihan pertama). Status: `loading`, `playing`, `paused`, `stopped`, `error`. `playing` baru dilaporkan setelah event `playing` atau Promise `play()` berhasil. Kegagalan izin autoplay dan sumber rusak dilaporkan sebagai error; tampilkan pesannya dan tombol coba lagi. Controller tidak melakukan autoplay saat dibuat. Seluruh track mengulang otomatis. Mengganti track membuang listener dan sumber lama; hasil Promise lama tidak dapat menimpa track baru. `dispose` aman dipanggil berulang.

## Aset asli untuk demo

Seluruh WAV adalah **audio sintetis asli**, bukan rekaman lapangan, musik komersial, atau percakapan nyata. Nama kategori menunjukkan suasana yang ditiru. Forest memakai desis dan nada burung sintetis; rain desis berlapis; ocean desis berpola ombak; café gemuruh dan denting sintetis tanpa kata; instrumental akor sintetis; lo-fi akor dan ketukan sederhana; white noise derau acak. Kualitas ini sesuai demo, bukan pengganti perpustakaan rekaman profesional.

Tujuh file: `forest.wav`, `rain.wav`, `ocean.wav`, `cafe.wav`, `instrumental.wav`, `lofi.wav`, `white-noise.wav`. Semuanya 12 detik, mono, PCM16, 22.050 Hz, sekitar 517 KiB/file. Generator menggunakan sinyal periodik dan event yang membungkus akhir durasi; tidak ada jeda buatan pada loop. Pemutaran WAV browser tetap perlu diuji pada browser host sasaran.

Regenerasi offline dengan `python3 scripts/generate-audio.py` (Python + NumPy yang tersedia di lingkungan pembuatan). Tidak memakai API berbayar, unduhan, atau sumber eksternal. Seed tetap membuat hasil identik. Aset dan generator didedikasikan dengan CC0-1.0; lihat `public/audio/LICENSE.txt`. Attribution metadata disertakan untuk penelusuran asal, bukan kewajiban atribusi CC0.

Jika aplikasi dipasang di subpath, ubah `tracks` dengan `src` yang sesuai URL deployment; default memakai `/audio/`. Test: `npx vitest run tests/audio.test.js` memeriksa lifecycle/race dan header/durasi WAV. Test unit menggunakan media tiruan; pemeriksaan browser diperlukan untuk output audio sesungguhnya.
