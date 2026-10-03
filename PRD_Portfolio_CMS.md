# PRD — Portfolio Website + CMS (Rangga Prasetya)

> Versi 1.0 · Dokumen acuan untuk pengembangan (manual maupun dengan AI coding agent).
> Istilah teknis ditulis dalam bahasa Inggris agar konsisten dengan kode.

---

## 1. Ringkasan

Website portofolio pribadi untuk Fullstack Developer yang dikelola lewat CMS sendiri. Klien dan recruiter bisa melihat daftar project (studi kasus), profil, dan mengunduh CV terbaru. Pemilik (satu-satunya admin) bisa menambah/mengubah project dan mengganti CV tanpa menyentuh kode.

Website ini sendiri adalah **bukti kemampuan fullstack**: frontend, backend, database, CMS, SEO, dan performa.

## 2. Tujuan & Metrik Keberhasilan

| Tujuan | Metrik (target) |
|---|---|
| Performa sangat baik | Lighthouse **Mobile** Performance ≥ 95 pada semua halaman publik; LCP < 2,5 s, INP < 200 ms, CLS < 0,1 |
| SEO kuat | Lighthouse SEO = 100; semua halaman terindeks di Google Search Console; structured data valid (Rich Results Test) |
| Mudah dikelola | Menambah project baru lengkap dengan gambar < 10 menit; mengganti CV < 1 menit |
| Aksesibel | Lighthouse Accessibility ≥ 95; kontras WCAG AA |
| Menghasilkan kontak | Form kontak berfungsi, anti-spam aktif, notifikasi email terkirim |

**Catatan PageSpeed Insights:** skor *lab* (Lighthouse) bisa dikontrol penuh. Data *field* (Core Web Vitals dari pengguna nyata) baru muncul setelah situs punya cukup trafik, jadi jangan heran kalau di awal hanya lab data yang tampil.

## 3. Pengguna

1. **Client / calon klien** — ingin melihat hasil kerja, teknologi yang dipakai, dan cara menghubungi.
2. **Recruiter / hiring manager** — ingin melihat ringkasan skill, project unggulan, dan mengunduh CV.
3. **Admin (pemilik)** — mengelola konten lewat CMS.

## 4. Scope

### MVP (Fase 1)
**Publik:**
- Home: hero, project unggulan, skills/teknologi, CTA kontak
- Projects: daftar + filter (kategori/teknologi)
- Project detail (studi kasus): masalah → solusi → hasil, gallery, tech stack, link live/repo
- About: bio, foto, ringkasan pengalaman
- CV: halaman dengan tombol unduh; URL stabil `/cv.pdf` selalu mengarah ke CV terbaru
- Contact: form (nama, email, pesan) + link WhatsApp/LinkedIn/GitHub
- 404, `sitemap.xml`, `robots.txt`

**CMS (admin):**
- Login admin (single user)
- CRUD Projects (draft/publish, unggulan, urutan)
- CRUD Technologies
- Media library (alt text wajib)
- Global: Profile, SiteSettings, Resume (upload PDF)
- Inbox pesan dari form kontak
- Live Preview + draft preview

### Fase 2 (setelah MVP live)
- Experience, Education, Certifications sebagai data terstruktur (timeline + JSON-LD)
- Blog/artikel
- Testimoni klien
- Dua bahasa (id/en) dengan `hreflang`
- CV otomatis dibuat (PDF) dari data terstruktur

### Di luar scope
Multi-user/role, e-commerce, komentar, login publik.

## 5. Tech Stack (keputusan)

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | SSG/ISR, Metadata API, `next/image`, `next/font`, ekosistem besar |
| CMS | **Payload CMS 3 (tertanam di app Next.js yang sama)** | Open source, TypeScript, admin UI bawaan, Live Preview, drafts/versions, hooks untuk revalidate; satu repo & satu deploy |
| Backend | **Payload CMS 3 (Node runtime di Vercel Functions)**: API, auth admin, access control, hooks, Server Actions/route handlers | Satu codebase, tanpa server terpisah |
| Database | **Supabase PostgreSQL (region Singapore)** via `@payloadcms/db-postgres` | Sudah direncanakan; latensi rendah dari Indonesia; Payload hanya butuh connection string Postgres |
| Media storage | **Supabase Storage** (S3-compatible) lewat `@payloadcms/storage-s3` | Satu vendor untuk DB + file; alternatif: Cloudflare R2 / Vercel Blob |
| Styling | **Tailwind CSS** (+ komponen kecil buatan sendiri) | CSS kecil, tanpa runtime JS |
| Rich text | Payload **Lexical**, dirender di server | Tidak menambah JS ke klien |
| SEO | Next Metadata API + `@payloadcms/plugin-seo` + JSON-LD | Meta per halaman bisa diedit di CMS |
| Form | Server Action + **Zod** + **Cloudflare Turnstile** + **Resend** (email) | Anti-spam tanpa CAPTCHA berat |
| Analytics | **Vercel Speed Insights/Analytics** atau Umami/Plausible | Ringan, ramah privasi |
| Hosting | **Vercel** (function region `sin1`), DNS di Cloudflare | Deploy otomatis dari GitHub |
| Kualitas | ESLint, Prettier, **Vitest**, **Playwright** (smoke), **Lighthouse CI** | Mencegah regresi performa |

### Catatan khusus Supabase
- **Payload = backend; Supabase = database + storage.** Supabase Auth, PostgREST, dan RLS tidak dipakai untuk logika CMS. Otorisasi ditangani access control Payload.
- **Koneksi:** runtime (Vercel Functions) memakai connection string **pooler Supavisor**; migrasi memakai koneksi **langsung/session**. Batasi `pool.max` kecil (1-3) karena serverless.
- **Keamanan:** Supabase otomatis meng-expose schema `public` lewat REST API. Pakai schema terpisah (`schemaName: 'payload'` di adapter) dan jangan expose schema itu di pengaturan API, atau aktifkan RLS pada semua tabel tanpa policy. Anon key **tidak** dipakai di frontend.
- **Free tier:** project bisa auto-pause jika lama tidak aktif. Halaman statis tetap tampil, tetapi admin, form kontak, dan revalidate akan gagal. Pasang ping terjadwal (Vercel Cron/GitHub Actions) atau upgrade plan; cek kebijakan terbaru Supabase.
- **Migrasi:** di production gunakan migration file Payload, bukan `push` otomatis.

Alternatif jika prioritas tunggal adalah skor PageSpeed setinggi mungkin dan kamu tidak perlu menonjolkan sisi backend: **Astro + Sanity/Keystatic**. Keputusan PRD ini tetap Next.js + Payload karena situs ini juga berfungsi sebagai proyek fullstack.

## 6. Arsitektur & Strategi Rendering

- Semua halaman publik **di-generate statis (SSG)** dan dilayani dari CDN.
- Saat konten berubah di CMS, hook `afterChange`/`afterDelete` memanggil `revalidatePath`/`revalidateTag` (on-demand ISR) sehingga perubahan tampil dalam hitungan detik tanpa rebuild penuh.
- Halaman admin (`/admin`) dan API Payload dinamis, tidak masuk sitemap, dan diberi `noindex`.
- Query data memakai **Payload Local API** dari Server Components (tanpa HTTP internal).
- Client JS dibatasi pada "island" kecil: filter project, form kontak, navigasi mobile.

```
/app
  (frontend)/            # halaman publik
    page.tsx             # Home
    projects/page.tsx
    projects/[slug]/page.tsx
    about/page.tsx
    cv/page.tsx
    contact/page.tsx
    sitemap.ts  robots.ts
  (payload)/admin/...    # Payload admin
  api/...                # route handler (contact, revalidate, cv.pdf)
/collections             # Users, Projects, Technologies, Media, Inquiries
/globals                 # Profile, SiteSettings, Resume
/lib                     # seo helpers, jsonld, revalidate
```

## 7. Model Data

**Projects**
- `title` (req), `slug` (unik, otomatis dari title, bisa diedit)
- `summary` (≤ 160 karakter, dipakai sebagai default meta description)
- `cover` (Media, req), `gallery` (array Media)
- `category` (select: fullstack / frontend / backend / iot / other)
- `role`, `year`, `clientName` (opsional), `clientType`
- `techStack` (relationship → Technologies, banyak)
- `links`: `live`, `repo`
- `content` (Lexical: Masalah / Solusi / Hasil)
- `metrics` (array: `label`, `value`) — angka hasil, jika ada
- `featured` (boolean), `order` (number)
- `seo` (`title`, `description`, `image`) dari plugin SEO
- `_status` (draft/published) + versions

**Technologies**: `name`, `slug`, `icon` (Media/SVG), `category` (frontend/backend/database/iot/tools)

**Media**: file, `alt` (wajib), `caption`; ukuran turunan (thumbnail, card, hero) dalam AVIF/WebP

**Inquiries**: `name`, `email`, `message`, `createdAt`, `status` (new/read/replied), `ipHash`

**Global Profile**: `name`, `headline`, `bio` (Lexical), `photo`, `location`, `availability` (teks status), `socialLinks` (LinkedIn, GitHub, dll.)

**Global Resume**: `file` (PDF, upload), `versionLabel`, `updatedAt` otomatis

**Global SiteSettings**: `siteName`, `siteUrl`, `defaultSeo`, `defaultOgImage`, `contactEmail`

**Akses (access control):** baca publik hanya untuk konten `published`; create/update/delete hanya user terautentikasi; Inquiries hanya bisa dibaca admin, dan dibuat lewat route handler yang tervalidasi.

## 8. Kebutuhan Fungsional Detail

### 8.1 CMS
- FR-1 Admin dapat menambah project baru dengan cover, gallery, tech stack, dan konten studi kasus.
- FR-2 Admin dapat menyimpan draft dan melihat **Live Preview** sebelum publish.
- FR-3 Admin dapat menandai project sebagai unggulan dan mengatur urutan tampil.
- FR-4 Admin dapat mengunggah CV PDF baru; `/cv.pdf` langsung menyajikan versi terbaru (header `Content-Disposition` dengan nama file `CV_Rangga_Prasetya.pdf`).
- FR-5 Setiap perubahan yang dipublikasikan memicu revalidate halaman terkait (project, daftar project, home, sitemap).
- FR-6 Upload gambar wajib mengisi `alt`; gambar otomatis dikonversi dan diperkecil.
- FR-7 Admin dapat melihat dan menandai pesan dari form kontak.

### 8.2 Publik
- FR-8 Daftar project dengan filter kategori/teknologi tanpa reload penuh (progressive enhancement: tanpa JS tetap menampilkan semua project).
- FR-9 Halaman project menampilkan breadcrumb, tech stack, link live/repo, dan project terkait.
- FR-10 Form kontak: validasi Zod di klien dan server, Turnstile, rate limit per IP, email notifikasi via Resend, pesan sukses/gagal yang jelas.
- FR-11 Halaman 404 informatif dengan link ke Home dan Projects.

## 9. SEO (persyaratan)

- Satu `<h1>` per halaman, hierarki heading benar, HTML semantik (`header`, `nav`, `main`, `article`, `footer`).
- `title` dan `description` unik per halaman (dari field SEO di CMS, dengan fallback otomatis).
- URL bersih dan permanen (`/projects/nama-project`); **canonical** di setiap halaman.
- `sitemap.xml` dinamis (project published saja) dan `robots.txt` (blok `/admin`, `/api`).
- **Open Graph + Twitter Card**; gambar OG dibuat otomatis per project (`next/og`) atau dari field SEO.
- **JSON-LD**: `Person` (Home/About), `WebSite`, `BreadcrumbList`, dan `CreativeWork`/`SoftwareSourceCode` per project.
- Semua gambar punya `alt`; link internal antarhalaman (project terkait, CTA).
- Bahasa dokumen (`<html lang>`) benar; Fase 2 menambah `hreflang`.
- Daftarkan ke Google Search Console dan kirim sitemap; verifikasi via DNS.
- Tidak ada konten penting yang hanya muncul lewat JS klien.

## 10. Performa (persyaratan & anggaran)

**Target:** Lighthouse Mobile Performance ≥ 95, LCP < 2,5 s, INP < 200 ms, CLS < 0,1.

**Anggaran (performance budget):**
- Initial JS per halaman ≤ **100 KB gzip**; tanpa library berat di jalur kritis
- Gambar LCP ≤ **100 KB** (AVIF/WebP), diberi `priority` dan ukuran eksplisit
- Maksimal **2 font family / 3 weight**, self-host via `next/font`, `display: swap`, subset Latin
- Total request awal < 25; tanpa third-party script selain analytics ringan (dimuat `afterInteractive`/lazy)

**Praktik wajib:**
- SSG/ISR untuk semua halaman publik; Server Components sebagai default
- `next/image` dengan `sizes` benar, `loading="lazy"` untuk gambar di bawah fold, `placeholder="blur"`
- Tidak ada layout shift: semua media punya `width/height` atau `aspect-ratio`
- Animasi hanya dengan CSS (`transform`/`opacity`); animasi berat (mis. GSAP/Lenis) **tidak** di jalur kritis; jika dipakai, di-`dynamic import` dan dinonaktifkan pada `prefers-reduced-motion`
- Kompresi Brotli, cache header agresif untuk aset statis (`immutable`)
- Database dan function di region terdekat (Singapore) untuk operasi dinamis
- **Lighthouse CI** di GitHub Actions: build gagal jika skor turun di bawah ambang batas

## 11. Keamanan & Operasional

- Semua secret di environment variable; tidak ada secret di repo.
- Header keamanan: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- Password admin kuat; batasi percobaan login; pertimbangkan 2FA/SSO jika tersedia.
- Form kontak: Turnstile + honeypot + rate limit + validasi server.
- **Backup database** terjadwal (backup Supabase atau `pg_dump` mingguan) dan cadangan media.
- Error tracking ringan (Sentry free tier, opsional).
- Halaman `/admin` tidak diindeks (`noindex`, blok di `robots.txt`).

## 12. Aksesibilitas

- Kontras WCAG AA, fokus keyboard terlihat, skip-to-content link
- Semua kontrol dapat dioperasikan dengan keyboard; label form eksplisit
- Menghormati `prefers-reduced-motion` dan `prefers-color-scheme`
- Target sentuh ≥ 44 px

## 13. Kriteria Penerimaan (Definition of Done MVP)

1. Admin bisa membuat project lengkap, publish, dan halaman tampil di situs publik dalam < 1 menit setelah publish.
2. Mengunggah CV baru langsung mengubah file yang diunduh dari `/cv.pdf`.
3. Lighthouse Mobile pada Home, Projects, dan satu Project detail: Performance ≥ 95, SEO = 100, Accessibility ≥ 95, Best Practices ≥ 95.
4. Rich Results Test tanpa error untuk JSON-LD; `sitemap.xml` valid dan hanya berisi konten published.
5. Form kontak mengirim email dan menyimpan ke Inquiries; spam ditolak.
6. Tidak ada gambar tanpa `alt`; tidak ada CLS akibat gambar/font.
7. CI (lint, typecheck, test, Lighthouse CI) hijau; deploy production sukses di domain sendiri dengan HTTPS.

## 14. Rencana Pengerjaan

| Tahap | Isi |
|---|---|
| M0 Setup | Repo, Next.js + Payload, Supabase (DB + Storage), CI, environment |
| M1 CMS | Collections/globals, access control, hooks revalidate, Live Preview, seed data |
| M2 Halaman publik | Layout, Home, Projects, Project detail, About, CV, Contact, 404 |
| M3 SEO & performa | Metadata, sitemap/robots, JSON-LD, OG image, anggaran performa, Lighthouse CI, header keamanan |
| M4 Launch | Domain + HTTPS, Search Console, uji akhir di perangkat nyata, backup aktif |
| M5 Fase 2 | Experience/Education/Certifications, blog, i18n, testimoni |

## 15. Pertanyaan Terbuka

1. Perlu dua bahasa (Indonesia & Inggris) sejak awal atau Fase 2?
2. Apakah nama klien boleh ditampilkan di studi kasus, atau cukup jenis bisnisnya?
3. Arah desain: minimalis/photo-first, atau lebih eksperimental? (Menentukan seberapa banyak animasi yang aman untuk skor performa.)
4. Domain apa yang dipakai (mis. `ranggaprasetya.dev`)?
5. Perlu blog sejak awal untuk SEO, atau setelah MVP?
