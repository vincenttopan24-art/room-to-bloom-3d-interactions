# Latar ruangan dan pencahayaan

`RoomBackdrop` menempatkan gambar terang dan sunset pada satu bidang dengan koordinat yang sama. `lighting=0` berarti sunset hangat; `lighting=1` berarti siang terang. Nilai di antaranya membaurkan kedua gambar melalui opacity; tidak mengganti pilihan ruangan atau membangun ulang objek 3D.

```jsx
import { RoomBackdrop } from './src/controllers/LightingController.jsx';
<RoomBackdrop roomId="library" lighting={0.6} assetBase="/assets/"
  onAlignmentWarning={reason => console.warn(reason)}>
  <button style={{position:'absolute', left:'50%', top:'60%'}}>Open book</button>
</RoomBackdrop>
```

Props: `roomId` salah satu id di bawah; `lighting` angka 0–1 (default 1, dibatasi ke rentang itu); `assetBase` awalan URL (default `/assets/`); `children` hotspot; `className` untuk wrapper; `onAlignmentWarning(reason)` jika pasangan belum terverifikasi. Wrapper luar boleh mengatur lebar. Semua children berada di dalam bidang `position:relative` dengan `aspectRatio` gambar terang. Gunakan koordinat persentase untuk hotspot agar mengikuti ukuran gambar. Kedua gambar memakai `object-fit:contain`, posisi dan ukuran identik. Jangan beri tinggi/crop berbeda pada lapisan sunset.

`ROOMS` mengekspor `{id,label,bright,sunset,width,height,verified,notes?}`; `assetUrl(filename, base)` mengodekan nama file per segmen, mempertahankan ejaan asli aset termasuk `university libary.png`. Semua sumber asli tidak diubah.

## Pemeriksaan pasangan

Contact sheet 18 gambar diperiksa, lalu blend 50% park dan living diperiksa lebih besar. Koordinat meja, kursi, buku, jam, lampu, bingkai jendela, rak, dan latar tetap sejajar. Pemeriksaan tambahan membandingkan gradien grayscale pada ukuran 512×288: korelasi tepi 0,80–0,91, konsisten dengan perubahan warna/bayangan. Ini verifikasi visual untuk aset saat ini, bukan jaminan otomatis untuk aset pengganti.

| id | Gambar terang | Sunset | Ukuran bidang | Korelasi tepi |
|---|---|---|---|---|
| library | university libary.png | university libary sunset.png | 1670×941 | 0,887 |
| cafe | university cafe.png | university cafe sunset.png | 1672×941 | 0,862 |
| garden | botanical garden.png | botanical garden sunset.png | 1670×942 | 0,868 |
| beach | Beachside.png | beachside sunset.png | 1670×941 | 0,813 |
| classroom | university classroom.png | university classroom sunset.png | 1670×941 | 0,912 |
| living | Living Room.png | living room sunset.png | 1670×942 | 0,800 |
| colourful | Colourful study room.png | colorful study room Sunset Light.png | 1670×941 | 0,912 |
| rooftop | rooftop.png | rooftop sunset.png | 1472×1068 | 0,867 |
| park | local park.png | local garden sunset.png | 1670×941 | 0,821 |

Kesembilan pasangan ditandai `verified:true`. Nama sunset untuk park berbeda, tetapi meja, lampu, jembatan, dan paviliun yang terlihat sama, sehingga tidak dianggap pasangan hilang. Gambar sunset library, beach, classroom, colourful, park tingginya 942, sedangkan versi terang 941: `contain` memusatkan keduanya dengan selisih skala kurang dari 0,11%; tepi tersisa di bidang tampil kurang dari satu piksel sumber. Rooftop memang lebih tinggi dibanding ruangan lain dan mempertahankan aspek 1472:1068.

Jika aset baru tidak sejajar, ubah `verified:false`, isi `notes` dengan alasan. Komponen mempertahankan gambar terang dan pilihan ruangan, menonaktifkan lapisan sunset, menampilkan catatan `role=note`, dan mengirim callback. Jika sunset gagal dimuat, gambar terang dan catatan aksesibel tetap ada. Jika gambar terang gagal, tampil pesan `role=alert`. Gambar sunset dekoratif tidak diulang pembaca layar.

Test: `npx vitest run tests/lighting.test.js` memeriksa sumber yang benar-benar ada, URL, arah slider, koordinat/aspek bersama, dan jalur penolakan pasangan yang belum terverifikasi. Pemeriksaan akhir browser/screenshot dilakukan pada demo terintegrasi.
