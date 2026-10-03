# Panduan Hosting Database di Supabase & Website di Vercel

Panduan lengkap untuk mempublikasikan website portofolio Rangga Labs menggunakan **Supabase** (PostgreSQL & Storage) dan **Vercel** (Next.js Hosting).

---

## Ringkasan Arsitektur
* **Database & Cloud Storage**: Supabase (PostgreSQL untuk tabel konten & Supabase Storage untuk upload gambar/CV PDF).
* **Web Hosting**: Vercel (Edge & Serverless Next.js 16 App Router).
* **Dual-Mode Resilient**: Jika environment variable Supabase belum diisi, aplikasi otomatis memakai mode lokal (`data/db.json`). Begitu variable Supabase diisi, aplikasi langsung aktif menggunakan database Supabase.

---

## BAGIAN 1: Setup Database di Supabase

### 1. Buat Project Supabase Baru
1. Buka [https://supabase.com](https://supabase.com) dan login/daftar.
2. Klik tombol **New project**.
3. Masukkan:
   - **Name**: `ranggalabs-portfolio` (atau sesuai keinginan Anda)
   - **Database Password**: Buat password yang kuat dan simpan baik-baik.
   - **Region**: Pilih region terdekat (misalnya `Singapore (ap-southeast-1)` untuk kecepatan optimal di Indonesia).
4. Klik **Create new project** dan tunggu 1-2 menit hingga setup selesai.

### 2. Jalankan Migrasi Schema & Data Awal
1. Di sidebar dashboard Supabase, buka menu **SQL Editor**.
2. Klik **New query**.
3. Buka file [supabase/schema.sql](file:///c:/Users/Rangga%20Prasetya/Documents/ranggalabs_portofolio/supabase/schema.sql) di project ini, lalu salin (**Copy**) seluruh isinya.
4. Tempel (**Paste**) ke dalam SQL Editor Supabase, lalu klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. **Selesai!** Script ini otomatis:
   - Membuat 6 tabel: `projects`, `profile`, `resume_settings`, `site_settings`, `media_items`, `inquiries`.
   - Mengatur Row Level Security (RLS) & policy izin akses publik.
   - Membuat storage bucket bernama `portfolio` dengan akses publik untuk media & CV.
   - Memasukkan seluruh data awal (seed data) yang sudah ada di portofolio Anda.

### 3. Salin API Keys & URL Supabase
1. Di sidebar dashboard Supabase, klik ikon **Settings** (roda gigi di kiri bawah) -> pilih **API** (atau **Project Settings -> Data API**).
2. Catat 3 nilai berikut:
   - **Project URL** (contoh: `https://abcdefghijklmn.supabase.co`)
   - **Project API Keys - `anon` `public`**
   - **Project API Keys - `service_role` `secret`** *(Klik "Reveal" untuk melihatnya)*

---

## BAGIAN 2: Testing Lokal dengan Supabase (Opsional)

Jika ingin menguji koneksi Supabase di laptop Anda sebelum deploy ke Vercel:

1. Buat file `.env.local` di root project (salin dari `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   ADMIN_EMAIL=admin@rangga.dev
   ADMIN_PASSWORD=portfolio-master-2024
   REVALIDATE_SECRET=cms-revalidate-secret-token
   ```

2. Jalankan seed data (jika ingin sinkronisasi data dari `data/db.json` via CLI):
   ```bash
   npm run db:seed
   ```

3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   Coba buka `http://localhost:3000` dan login ke `/admin`. Setiap perubahan yang Anda buat di admin akan langsung tersimpan di Supabase!

---

## BAGIAN 3: Deploy Website ke Vercel

### 1. Push Project ke GitHub
Pastikan semua perubahan terbaru sudah di-commit dan di-push ke repository GitHub Anda:
```bash
git add .
git commit -m "feat: integrate supabase database and storage for vercel deployment"
git push origin main
```

### 2. Hubungkan ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** -> pilih **Project**.
3. Di daftar repository GitHub Anda, cari repository `ranggalabs_portofolio` dan klik **Import**.

### 3. Masukkan Environment Variables di Vercel
Pada halaman konfigurasi sebelum klik Deploy, buka accordion **Environment Variables** dan tambahkan variabel berikut satu per satu:

| Key | Value | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Dari Project Settings Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Service role key (wajib untuk server database & bypass RLS) |
| `ADMIN_EMAIL` | `admin@rangga.dev` | Email untuk login dashboard admin |
| `ADMIN_PASSWORD` | `portfolio-master-2024` | Password untuk login dashboard admin |
| `REVALIDATE_SECRET` | `cms-revalidate-secret-token` | Token on-demand revalidation |

### 4. Klik Deploy!
1. Klik tombol **Deploy**.
2. Vercel akan otomatis meng-install dependency, menjalankan `next build`, dan mem-publish portofolio Anda dalam kurun waktu ~1 menit.
3. Anda akan mendapatkan domain gratis dari Vercel seperti `ranggalabs-portfolio.vercel.app`.

---

## BAGIAN 4: Verifikasi & Fitur yang Sudah Terintegrasi

1. **Dashboard Admin (`/admin`)**:
   - Tambah, edit, dan hapus project langsung tersinkronisasi ke PostgreSQL Supabase.
   - Status draft & publish langsung terkelola secara dinamis.
2. **Media Library (`/admin/media`)**:
   - Unggah gambar otomatis masuk ke Supabase Storage bucket `portfolio/uploads/...` dan mendapatkan CDN public URL.
3. **Curriculum Vitae (`/admin/resume` & `/cv.pdf`)**:
   - Unggah CV PDF otomatis tersimpan di Supabase Storage dan dapat diunduh langsung dari `/cv.pdf`.
4. **Form Kontak (`/contact` & Inbox `/admin/inbox`)**:
   - Pesan yang dikirim oleh pengunjung otomatis tersimpan ke tabel `inquiries` di Supabase.

---

## Menghubungkan Custom Domain (Opsional)
Jika Anda sudah memiliki domain pribadi (misalnya `ranggaprasetya.dev`):
1. Di Dashboard Vercel, buka tab **Settings** -> **Domains**.
2. Masukkan domain Anda, lalu tambahkan DNS Record (A / CNAME Record) yang diberikan Vercel di penyedia domain Anda (Cloudflare, Niagahoster, DomaiNesia, dll).
