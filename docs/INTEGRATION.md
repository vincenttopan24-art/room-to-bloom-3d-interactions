# Integrasi ke proyek Manus

Tambahkan modul ini ke sumber website ROOM TO BLOOM yang sudah ada. Pertahankan navigasi, galeri ruang, desain, dan efek merobek/meremas yang telah dibuat. Repo sumber yang diperiksa berisi aset, bukan kode website terbit; nama komponen host, bentuk penyimpanan, dan API efek lama harus disesuaikan di proyek Manus. Contoh `saveHostSnapshot` dan `playExistingCrumple` di bawah adalah fungsi milik host yang harus Anda hubungkan, bukan ekspor paket.

## 1. Aset dan dependensi

Gunakan dependensi pada `package.json` dan satu versi React/Three yang sama dengan host. Komponen ini memakai React 19, Three, React Three Fiber dan Drei; pemuat GLB membutuhkan Suspense dan Canvas WebGL. Tidak ada API key bawaan.

Salin `public/assets/` ke folder statis host. Simpan nama dan huruf besar/kecil, termasuk `university libary.png`, `Colourful study room.png`, `CD.glb`, `red table lamp.glb`, `tea cup.glb`. `assetBase` adalah URL folder yang berakhir `/`, misalnya `/room-to-bloom/assets/`. `assetUrl` mengodekan spasi dan segmen nama file. Model beserta tekstur tertanam tetap berasal dari GLB asli; jangan menggantinya dengan bentuk sederhana.

Salin juga `public/audio/` jika memakai audio demo. Ketujuh suara adalah **sintesis asli**, bukan rekaman alam/percakapan atau lagu berlisensi komersial; WAV 12 detik dengan lisensi CC0. Untuk subpath, berikan `audioTracks` yang URL `src`-nya disesuaikan. Lisensi audio tidak menyatakan hak atas ilustrasi atau GLB asli.

Untuk integrasi per komponen, impor modul individual. Gaya `src/styles.css` dibatasi pada container `.bloom-demo` dan `.rtb`; gaya itu tidak mereset tombol atau elemen host di luar container. Jika ingin memakai gaya kontrol bawaan, impor stylesheet dan bungkus kontrol standalone dengan `<div className="rtb">`. Demo sudah memakai `.bloom-demo`. Font Google eksternal memiliki font pengganti lokal.

OptionWheel disertakan dari sumber resmi [React Bits](https://reactbits.dev/components/option-wheel), registry [OptionWheel JS-CSS](https://reactbits.dev/r/OptionWheel-JS-CSS.json), dengan kode komponen asli. Pertahankan [REACT-BITS-LICENSE.md](../src/vendor/REACT-BITS-LICENSE.md) dan pemberitahuan copyright. Lisensinya MIT + Commons Clause, dengan ketentuan penggunaan/distribusi pada file tersebut.

## 2. Satu provider untuk state bersama

```jsx
import { StudyProvider } from './room-to-bloom/src/core/StudyProvider.jsx';

<StudyProvider
  storageKey="room-to-bloom-v1"
  initial={hostInitialSnapshot}
  onStateChange={saveHostSnapshot}
  onPaperCrumpled={(paper, state) => playExistingCrumple(paper.taskId)}
>
  <ExistingRoom />
</StudyProvider>
```

`initial` adalah snapshot parsial sekali saat mount, bukan state terkontrol yang disinkronkan pada setiap render. Provider memvalidasi snapshot dan storage. Untuk penyimpanan host sebagai satu-satunya sumber, gunakan `storage={null}` dan simpan melalui callback. Untuk storage sendiri, berikan objek `{getItem,setItem}`. Ganti storage key dengan me-remount provider.

`onStateChange(state)` berjalan saat mount dan setiap perubahan, termasuk tick timer 250 ms. Jika disimpan ke server, batasi frekuensi callback penyimpanan di host. `onPaperCrumpled(paper,state)` berjalan saat kertas beralih menjadi `crumpled`, termasuk setelah lemparan meleset, tetapi tidak saat sekadar memulihkan snapshot crumpled. Efek lama yang hanya boleh diputar sekali per tugas perlu memeriksa ID/lifecycle tersebut.

Hook yang tersedia:

```js
const { state, dispatch, limits, storageError } = useStudy();
const stateOnly = useStudyState();
const dispatchOnly = useStudyActions();
```

Semua hook harus di bawah provider. Tangani `storageError` dengan pesan di UI; state tetap dapat digunakan ketika storage browser ditolak. Detail bentuk state dan semua action ada di [STATE.md](STATE.md).

## 3. Pasang objek di Canvas host

Impor dari `src/objects/Clock.jsx`, `Tea.jsx`, `TV.jsx`, `Notebook.jsx`, `CDPlayer.jsx`, `Calendar.jsx`, `Lamp.jsx`, `Bin.jsx`. Nama ekspor sesuai nama file; setiap objek menerima `assetBase`. Tempatkan objek dalam Canvas yang sudah ada, di dalam provider dan Suspense, dengan cahaya/kamera yang sesuai. Jangan menaruh kontrol HTML biasa di dalam Canvas.

```jsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Notebook } from './room-to-bloom/src/objects/Notebook.jsx';
import { NotebookControls } from './room-to-bloom/src/Controls.jsx';
import './room-to-bloom/src/styles.css';

<>
  <Canvas camera={{ position: [0, 5.4, 5.2], fov: 38 }}>
    <ambientLight intensity={2} />
    <directionalLight position={[3, 6, 4]} intensity={2} />
    <Suspense fallback={null}><Notebook assetBase="/assets/" /></Suspense>
  </Canvas>
  <div className="rtb"><NotebookControls /></div>
</>
```

`InteractiveGLB` dan `usePreparedModel` menangani scene clone dan framing masing-masing model. Transformasi untuk bagian yang bergerak dikalibrasi dari GLB yang disertakan, sehingga model pengganti perlu kalibrasi ulang. `book_stack.glb` dan model island tetap disertakan sebagai aset; keduanya bukan launcher interaksi baru.

Kontrol HTML yang diekspor dari `Controls.jsx`: `TimerControls`, `NotebookControls`, `TVScreen`, `TVScreenView`, `MusicControls`, `LampControls`, `BinControls`. `TVScreen` membaca provider melalui hook. `TVScreenView({study,onApplyAudio,aiRecommend})` menerima snapshot `{state,dispatch,...}` secara eksplisit: pakai ini ketika merender UI pada root React terpisah, seperti `Html` dari Drei. Komponen `TV` sudah membaca `useStudy()` di luar `Html` dan meneruskan snapshot itu ke `TVScreenView`, sehingga tidak mengandalkan context menyeberangi root DOM tersebut. `TimerControls` juga memiliki tombol mulai istirahat. Uap aktif hanya ketika `phase==='break' && status==='running'`; habis studi menyiapkan istirahat idle, tidak otomatis memulainya.

Untuk alur fokus, dispatch `{type:'FOCUS',id:'notebook'}` dan `{type:'CLOSE'}`. ID objek: `clock`, `notebook`, `cd`, `tea`, `tv`, `calendar`, `lamp`, `bin`. `CameraFocusController` dari `controllers/AnimationController.jsx` menerima `{focused,target,lookAt,onReturned}` dan harus berada di Canvas. Host tetap mengatur dialog, fokus keyboard, Escape, dan satu objek aktif jika memakai komponen individual. Demo menyertakan contoh lifecycle lengkap.

`RoomToBloomDemo({providerProps,assetBase,audioTracks,onCrumple,aiRecommend,initialObject})` membungkus pengelola dengan provider. `ObjectInteractionManager` menerima prop yang sama selain `providerProps`, dan harus berada di provider host. `initialObject` membuka satu objek yang valid ketika mount/prop berubah. Demo `main.jsx` membacanya dari query URL, misalnya `/?object=calendar`; ID yang diterima sama dengan daftar objek di atas.

## 4. Hubungkan tugas dan efek lama dengan ID stabil

Setiap subtask mempunyai `{id,text,completed}`. Gunakan ID tugas yang sudah dimiliki host, jangan indeks array atau ID baru setiap render.

```js
dispatch({ type:'MAIN_TASK', text:'Prepare presentation' });
dispatch({ type:'ADD_TASK', id:'existing-task-42', text:'Draft opening' });
dispatch({ type:'EDIT_TASK', id:'existing-task-42', text:'Write opening' });
dispatch({ type:'COMPLETE_TASK', id:'existing-task-42', now:Date.now() });
dispatch({ type:'CRUMPLE', id:'existing-task-42' });
```

`COMPLETE_TASK` **membalik** completed, bukan mengatur true. Panggil sekali pada peristiwa pengguna, dan hanya jika nilai host berbeda dari nilai provider. Jangan memanggilnya berulang saat sinkronisasi snapshot. Satu tugas menghasilkan satu catatan kertas; kertas yang sudah masuk bin tetap menjadi riwayat walaupun tugas dihapus atau dibatalkan.

Notebook mengantrekan snapshot pergantian halaman sesuai urutan masuk, termasuk beberapa ADD_TASK yang diproses sekaligus. Konten snapshot tidak berubah ketika tugas berikutnya diedit; teks terbaru pada halaman akhir muncul setelah antrean selesai. Teks utama memakai ukuran lebih besar dengan CanvasTexture pada material tanpa pengaruh lampu scene agar terbaca. Efek tulisan menampilkan huruf bertahap, bukan simulasi jejak pena.

Biarkan animasi robek/meremas host tetap berjalan. Pada transisi yang sesuai, kirim `CRUMPLE` dengan ID tugas yang sama. Pilih satu jalur pemicu efek: callback provider atau handler tombol host, agar animasi tidak dimulai dua kali. Tidak ada asumsi bahwa host memiliki fungsi bernama tertentu, dan paket tidak mengklaim mengimplementasikan ulang efek merobek lama.

Jika memakai fisika lempar bawaan, pasang `<Bin ref={binRef} assetBase="/assets/" />` dan panggil `binRef.current?.throwPaper(taskId)` setelah status kertas crumpled. Metode ini mengembalikan boolean diterima/ditolak. `BinControls` menerima `onCrumple(taskId)` dan `onThrow(taskId)`; sambungkan `onThrow` ke ref itu. Gerakan drag/lempar model mendispatch hasilnya sendiri. Jika host mempertahankan fisika sendiri, dispatch `THROW_PAPER` ketika mulai, `BIN_PAPER` hanya setelah benar-benar masuk, atau `MISS_PAPER` saat meleset. Jangan langsung menganggap setiap lempar berhasil.

## 5. Audio nyata, bukan sekadar state

```js
import { AudioController, DEFAULT_TRACKS } from './room-to-bloom/src/controllers/AudioController.js';
const audio = new AudioController({
  tracks: DEFAULT_TRACKS,
  onStateChange: next => dispatch({ type:'AUDIO', ...next }),
});
// Di handler klik/tap pengguna:
await audio.play(1);
// Saat pemilik controller dilepas:
audio.dispose();
```

Buat controller sekali per lifecycle dan bersihkan saat unmount; jangan membuatnya di setiap render. Di React StrictMode, buat instance baru pada setiap setup effect, bukan memakai ulang instance yang sudah disposed. `MusicControls` menerima `audioController` dan `error`. Status `playing` harus berasal dari callback media, agar CD berhenti saat audio loading/gagal/paused. Menetapkan action AUDIO sendiri tidak memutar suara.

Simpan pilihan track melalui state, tetapi browser tetap membutuhkan tindakan pengguna setelah reload. Controller baru tidak membawa elemen media lama; mulai `play(state.audio.track)` jika belum mempunyai audio, dan gunakan `resume()` untuk instance yang sudah pernah dipause. Jika autoplay ditolak, tampilkan error dan tombol coba lagi. `DEFAULT_TRACKS` bisa diganti dengan tujuh track berlisensi milik host; pertahankan urutan kategori. Detail ada di [AUDIO.md](AUDIO.md).

## 6. Ruang, lampu, dan TV

`RoomBackdrop({roomId,lighting,assetBase,children,className,onAlignmentWarning})` menempatkan children pada bidang gambar. `lighting=0` sunset, `1` terang. Gunakan hotspot persentase relatif gambar, bukan viewport; pertahankan aspect ratio, terutama rooftop yang lebih tinggi. `ROOMS` dan `assetUrl` ada di `core/rooms.js`. Peta hotspot demo ada di `core/hotspots.js`. Semua sembilan pasangan yang disertakan telah diperiksa; pengganti yang tidak sejajar harus diberi `verified:false` dan catatan sehingga sunset tidak dibaurkan. Lihat [LIGHTING.md](LIGHTING.md).

`TV` dan `TVScreen` menerima `aiRecommend(task)` opsional. Fungsi host mengembalikan Promise `{environment,sound,lighting,reason?}`: environment ID dari ROOMS, sound indeks 0–6, lighting angka 0–1. Default adalah rekomendasi kata kunci lokal, bukan panggilan model AI. Adapter yang gagal, invalid, atau melewati timeout memakai fallback lokal. Simpan kredensial AI pada server host. `onApplyAudio(index)` dipanggil saat pengguna menerapkan hasil; sambungkan ke `audio.play(index)` supaya media benar-benar berjalan.

## 7. Verifikasi sebelum integrasi dianggap selesai

Jalankan full `npm test`, `npm run build`, hentikan server lama, lalu jalankan preview baru. Hit URL GLB/PNG/audio yang memakai assetBase sebenarnya. Periksa browser: fokus satu objek dan kembali, pause/resume timer, isi satu subtask hingga halaman berubah, audio/CD, kalender tanggal lokal, semua ruangan pada slider 0/0,5/1, serta lemparan masuk dan meleset. Ambil screenshot setelah perubahan visual.

Demo lokal membuktikan modul dapat berjalan terpisah. Sumber website terbit, CSS host, adapter penyimpanan, backend AI, dan efek robek/meremas lama harus diuji kembali di proyek Manus; tidak ada klaim bahwa kode ini sudah terpasang pada website publik. [INSPECTION-ID.md](INSPECTION-ID.md) mencatat pemeriksaan awal; lihat laporan penyerahan untuk hasil verifikasi terakhir.
