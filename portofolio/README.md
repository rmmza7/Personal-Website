# Personal Portfolio — IT Presales Engineer

Website portofolio personal dengan UI/UX **SAP Fiori** untuk profesi IT Presales Engineer. Sepenuhnya statis (HTML + CSS + JS) — siap deploy ke Cloudflare Pages.

---

## Struktur File

```
portfolio/
├── index.html              # Halaman utama
├── css/
│   └── styles.css          # Styling SAP Fiori (Quartz Light)
├── js/
│   └── main.js             # Logika upload foto, persistensi, brand logos
├── assets/
│   └── default-avatar.svg  # Avatar default (Fiori-style)
└── README.md               # Dokumen ini
```

---

## Fitur

| Fitur | Penjelasan |
|------|-----------|
| **Foto profil editable** | Upload via tombol **Ubah Foto** atau drag & drop ke avatar. Mendukung **PNG, JPG, JPEG, WebP**. Maks 5 MB. Otomatis di-resize ke 512px untuk efisiensi penyimpanan. |
| **Persistensi** | Foto & nama tersimpan di `localStorage` browser — tetap ada saat halaman direfresh. Klik **Reset** untuk kembali ke default. |
| **Editable name** | Klik nama di bagian header untuk mengubahnya langsung di halaman. |
| **Brand logos otomatis** | Logo vendor dimuat dari Clearbit Logo API. Jika offline / gagal, fallback ke label teks yang rapi — halaman tidak pernah terlihat rusak. |
| **Tab navigation reaktif** | Tab di bawah header otomatis menyorot section aktif sesuai posisi scroll. |
| **Responsif** | Bekerja baik di desktop, tablet, dan mobile (≥360px). |
| **SAP Fiori Quartz Light** | Palet warna, tipografi (Source Sans 3 — pengganti gratis font 72), shell bar, KPI tile, IconTabBar, Object Page header. |

---

## Cara Deploy ke Cloudflare Pages

### Opsi 1 — Direct Upload (paling cepat)

1. Login ke **Cloudflare Dashboard** → menu **Workers & Pages**.
2. Klik **Create application** → tab **Pages** → **Upload assets**.
3. Beri nama project (mis. `presales-portfolio`).
4. Drag & drop folder `portfolio/` (atau zip-nya) ke area upload.
5. Klik **Deploy site**. Selesai — Cloudflare akan memberi URL `*.pages.dev`.

### Opsi 2 — Git Integration (recommended untuk update berkala)

1. Push folder `portfolio/` ke repo Git (GitHub / GitLab).
2. Di Cloudflare Pages → **Create application** → **Connect to Git** → pilih repo.
3. **Build settings:**
   - **Framework preset:** `None`
   - **Build command:** *kosongkan* (tidak perlu build)
   - **Build output directory:** `/` atau folder root proyek
4. **Save and Deploy.**

### Opsi 3 — Wrangler CLI

```bash
npm install -g wrangler
cd portfolio
wrangler pages deploy . --project-name=presales-portfolio
```

### Custom Domain (opsional)

Setelah deploy:
**Project → Custom domains → Set up a custom domain** → masukkan domain Anda (mis. `nama.com`). Cloudflare akan otomatis menghandle DNS dan SSL.

---

## Cara Kustomisasi

### Mengubah nama, email, LinkedIn

Edit `index.html`:

- **Nama** → bisa langsung di halaman dengan klik pada nama, **atau** ubah di:
  ```html
  <h1 class="identity__name" id="profileName" ...>Nama Anda</h1>
  ```
- **Email** (di section Contact):
  ```html
  <a href="mailto:your.email@example.com" class="btn btn--primary">
  ```
- **LinkedIn**:
  ```html
  <a href="#" class="btn btn--ghost" id="linkedinBtn">
  ```
  Ganti `href="#"` dengan URL LinkedIn Anda.

### Menambah / mengubah brand vendor

Pada `index.html`, tiap kartu brand mengikuti pola:

```html
<div class="brand-card" data-domain="example.com" data-name="Brand Name">
  <div class="brand-card__logo"></div>
  <span class="brand-card__name">Brand Name</span>
</div>
```

Cukup tambahkan blok di atas — `data-domain` (domain resmi vendor) dipakai oleh Clearbit untuk fetch logo otomatis.

### Mengubah palet warna

Semua warna ada di **CSS variables** di awal `css/styles.css`:

```css
:root {
  --fiori-shell-bg: #354a5f;
  --fiori-blue: #0a6ed1;
  --fiori-page-bg: #f7f7f7;
  /* ... */
}
```

### Mengganti foto default

Replace `assets/default-avatar.svg` dengan file SVG/PNG lain. Atau cukup upload foto pribadi via tombol **Ubah Foto** di halaman.

---

## Catatan Teknis

- **Tidak ada build step** — pure HTML/CSS/JS.
- **Tidak ada server-side state** — foto profil disimpan di browser pengunjung (yaitu Anda) lewat `localStorage`. Cocok untuk portfolio personal di perangkat sendiri. Kalau ingin foto persisten lintas-device, ganti default avatar dengan foto Anda di file `assets/`.
- **Privacy:** semua data tetap di browser; tidak ada tracking atau analytics yang aktif secara default.
- **Performance:** ~30 KB total CSS/JS (un-gzipped); foto profil di-recompress otomatis.

---

## Browser Support

Modern Chrome, Edge, Firefox, Safari (versi 2 tahun terakhir). IE tidak didukung.
