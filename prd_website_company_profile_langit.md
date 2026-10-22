# Product Requirements Document (PRD): Ekosistem Digital "Langit"

| Informasi Dokumen | Detail Spesifikasi |
| :--- | :--- |
| **Nama Proyek** | Langit Multi-Service Digital Ecosystem (Company Profile, Service Hub & CMS) |
| **Versi Dokumen** | 2.1.0 (Master Consolidated Edition) |
| **Tech Stack Utama** | Laravel 13, React.js, Tailwind CSS Terbaru (v4), HTML5 Semantic, MySQL (phpMyAdmin) |
| **Portal Sistem** | 1. Public / Visitor Portal (Multi-Layout Adaptive Experience) <br> 2. Admin / Back-Office CMS Dashboard |
| **Tema Desain** | *Futuristic Modern Tech, Deep Dark Mode, Glassmorphism, Bento Grid, Lightweight Motion* |
| **Target Performa** | Google Lighthouse Performance $\ge 90$, First Contentful Paint (FCP) $< 1.2\text{ detik}$ |

---

## 1. Ikhtisar Proyek (Project Overview)
**Langit** adalah perusahaan multi-disiplin yang bergerak di bidang teknologi, kreatif, layanan perangkat keras, penyewaan alat produksi, hingga edukasi. 

Website ini dirancang bukan sebagai brosur statis biasa, melainkan sebagai **ekosistem digital interaktif berkinerja tinggi**. Keunggulan utama website ini terletak pada pendekatan **Adaptive Service Experience**: ketika pengunjung memilih salah satu dari 7 layanan Langit, antarmuka halaman (UI), tata letak (*layout*), atmosfer warna aksen, serta fitur interaktifnya (UX) akan **berubah menyesuaikan karakteristik layanan tersebut**, namun tetap ringan dan berada dalam satu benang merah desain teknologi modern.

---

## 2. Arsitektur & Spesifikasi Teknologi (Tech Stack)

| Lapisan Sistem | Teknologi yang Digunakan | Peran & Implementasi Teknis |
| :--- | :--- | :--- |
| **Markup & Struktur** | **HTML5 Terbaru (Semantic Web)** | Penggunaan elemen semantik modern (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<dialog>`) untuk aksesibilitas tinggi dan optimasi struktur SEO. |
| **Frontend Library** | **React.js (via Inertia.js & Vite)** | Membangun antarmuka *Single Page Application (SPA)* yang reaktif. Perpindahan antar halaman dengan *layout* berbeda berjalan mulus tanpa *reload* browser penuh. |
| **Styling Framework** | **Tailwind CSS Terbaru (v4 Engine)** | Memanfaatkan *CSS-first configuration*, *container queries*, *backdrop-filter* (Glassmorphism), *Bento Grid*, dan *zero-runtime CSS* yang menghasilkan ukuran file sangat kecil. |
| **Backend Framework** | **Laravel 13 (PHP 8.3+)** | Mengelola *routing*, logika bisnis 7 divisi layanan, autentikasi Admin, antrean kompresi gambar otomatis (*Laravel Queues*), keamanan data, dan integrasi API. |
| **Database & GUI** | **MySQL 8.x & phpMyAdmin** | Penyimpanan data relasional untuk galeri foto, katalog sewa alat, tiket servis komputer, pendaftar *internship*, hingga jadwal konsultasi, yang dikelola secara visual melalui **phpMyAdmin**. |
| **Animasi Ringan** | **Native CSS GPU + Framer Motion (`LazyMotion`)** | Animasi dibatasi pada properti komposit GPU (`transform: translate3d, scale`, `opacity`) dan *Intersection Observer* agar berjalan mulus $60\text{ FPS}$ tanpa membebani perangkat pengguna. |
| **Media Processing** | **Intervention Image / Spatie MediaLibrary** | Otomatisasi konversi foto unggahan Admin ke format `.webp` dengan beberapa resolusi (*thumbnail*, *medium*, *full HD*). |
| **Notifikasi Eksternal** | **WhatsApp API Gateway & SMTP** | Mengirimkan rincian booking sewa alat, tiket servis, pendaftaran magang, dan jadwal konsultasi langsung ke WhatsApp Admin dan klien. |

---

## 3. Sistem Desain, Navigasi (Headbar) & Hero Section

### 3.1 Palet Warna & Tipografi
* **Background Primary:** Deep Obsidian (`#07090E`) & Midnight Slate (`#0F172A`).
* **Surface / Cards:** Glassmorphism (`bg-white/5`, `backdrop-blur-md`, `border border-white/10`).
* **Tipografi:** 
  * *Heading:* **Space Grotesk** atau **Syne** (Geometris, tegas, berkesan teknologi masa depan).
  * *Body & UI:* **Plus Jakarta Sans** atau **Inter** (Tingkat keterbacaan tinggi di semua ukuran layar).

### 3.2 Struktur Headbar / Topbar Modern
Headbar dirancang dengan gaya **Floating Glassmorphism Pill** yang melayang di bagian atas layar (*sticky*) dan mengecil secara dinamis (*compact mode*) saat pengguna menggulir halaman ke bawah. Susunan menu utamanya adalah:

1. **Logo "LANGIT"** (Kiri $\rightarrow$ Kembali ke Beranda Utama)
2. **Layanan** (Trigger membuka *Interactive Bento Mega-Menu Dropdown*)
3. **Portofolio** (Direct Link $\rightarrow$ Hub Karya Lintas Divisi & Galeri Foto Langit)
4. **Internship** (Direct Link $\rightarrow$ Portal Rekrutmen Magang & Talenta)
5. **Kontak** (Direct Link $\rightarrow$ Pusat Komunikasi & Peta Studio)
6. **Konsultasi** (Kanan $\rightarrow$ *Primary CTA Button* dengan aksen *glow gradient* Cyan-Violet)

### 3.3 Dropdown Menu "Layanan" (Interactive Bento Card Mega-Menu)
Saat pengguna mengklik atau mengarahkan kursor (*hover*) ke menu **Layanan**, muncul panel *Mega-Menu* berbentuk **kumpulan Bento Cards modern** (bukan daftar teks biasa). Setiap *card* memiliki ikon vektor menyala, ringkasan 1 baris, dan warna aksen identitas:

1. **Photography & Videography** (Aksen: *Amber Gold* `#F59E0B` — Visual & Sinema)
2. **Web Development** (Aksen: *Electric Cyan* `#0EA5E9` — Kode & Arsitektur Sistem)
3. **Langit Education** (Aksen: *Emerald Green* `#10B981` — Akademi & Pelatihan)
4. **Computer Service** (Aksen: *Crimson Orange* `#F97316` — Diagnostik & Perangkat Keras)
5. **Internship** (Aksen: *Nebula Violet* `#8B5CF6` — Inkubasi Karier & Talenta)
6. **Sewa Alat** (Aksen: *Teal Matrix* `#14B8A6` — Katalog Gear & Rental Produksi)
7. **Kolaborasi** (Aksen: *Rose Magenta* `#EC4899` — Kemitraan B2B, Kampus & Event)

### 3.4 Hero Section Utama (Beranda)
* **Layout:** *Asymmetric Bento Hero* yang memadukan tipografi kinetik di sisi kiri dan *Interactive Card Stack* di sisi kanan.
* **Visual Background:** Efek *Aurora Mesh Gradient* berbasis CSS murni yang ringan, dipadukan dengan cuplikan *video showreel* berformat WebM terkompresi di dalam *floating glass frame*.
* **Interactive Quick-Jump:** Barisan kartu interaktif di bagian bawah Hero untuk melompat langsung ke pengecekan resi servis komputer, katalog sewa alat, atau galeri foto.

### 3.5 Strategi Animasi Keren & Ringan (Zero-Bloat Motion)
1. **CSS Spotlight Border Hover:** Efek sorotan cahaya mengikuti pergerakan kursor di tepi *card* menggunakan CSS Variables (`--mouse-x`, `--mouse-y`) tanpa memicu *re-render* React.
2. **Dynamic Code Splitting (`React.lazy`):** Aset dan kode untuk masing-masing dari 7 tampilan layanan hanya diunduh ketika halaman tersebut dibuka.
3. **Blurhash / Skeleton Image Loading:** Semua foto galeri menampilkan *placeholder* gradasi halus sebelum gambar `.webp` selesai dimuat untuk mencegah *layout shift* ($\text{CLS} = 0$).

---

## 4. Portal 1 (Public): 7 Desain Tampilan Layanan yang Berbeda

Setiap item pada dropdown **Layanan** memiliki arsitektur halaman, tata letak (*layout*), dan komponen fungsional yang **berbeda satu sama lain**:

### 4.1 Layanan 1: Photography & Videography
* **Konsep Layout:** *Cinema & Darkroom Showcase Layout* (Latar belakang ekstra gelap `#050507` agar kontras visual foto dan video tampil maksimal).
* **Fitur & Komponen Khusus:**
  * **Full-Screen Showreel Header:** Video sinematik *autoplay* (tanpa suara) dengan tombol *Play Full Reel with Audio*.
  * **Langit Photo Gallery (Masonry Grid + EXIF Inspector):** Galeri foto hasil karya Langit dengan filter instan (*Commercial, Wedding, Product, Drone Aerial, Event*). Saat foto diklik, *Lightbox* menampilkan foto resolusi tinggi beserta **Metadata Kamera/EXIF** (*Camera Body, Lens, Focal Length, Shutter Speed, ISO*).
  * **Interactive Before/After Color Grading Slider:** Komponen geser interaktif untuk membandingkan foto mentah (*RAW*) dengan hasil akhir (*Color Graded*) karya tim Langit.
  * **Gear & Studio Showcase:** Kartu interaktif yang memamerkan peralatan tempur tim visual Langit.

### 4.2 Layanan 2: Web Development
* **Konsep Layout:** *IDE & Cyber-Architecture Blueprint Layout* (Menggunakan aksen garis *grid* halus menyerupai kanvas teknis dan jendela kode modern).
* **Fitur & Komponen Khusus:**
  * **Interactive Multi-Device Mockup Previewer:** Pengunjung dapat memilih proyek website buatan Langit dan menguji tampilannya secara interaktif dalam mode layar *Desktop*, *Tablet*, atau *Smartphone* langsung di halaman.
  * **Tech Stack & Performance Bento:** Menampilkan penguasaan teknologi (Laravel 13, React, Tailwind, MySQL, Payment Gateway) beserta grafik skor kecepatan *Google Lighthouse*.
  * **Interactive Web Price Estimator (Kalkulator Proyek Web):** Klien dapat mencentang fitur yang diinginkan (misal: *Company Profile, E-Commerce, Custom CMS, Integrasi WhatsApp, SEO Basic*) dan melihat estimasi harga serta waktu pengerjaan secara *real-time*.

### 4.3 Layanan 3: Langit Education
* **Konsep Layout:** *Modern Academy & Learning Hub Layout* (Tata letak terstruktur, bersih, dengan kartu kurikulum yang mudah dipindai).
* **Fitur & Komponen Khusus:**
  * **Program & Bootcamp Filter Cards:** Menampilkan daftar kelas (*Web Programming, Fotografi Dasar hingga Mahir, Video Editing, Teknisi Komputer*) lengkap dengan indikator level (*Beginner, Intermediate, Advanced*), kuota tersisa, dan jadwal angkatan (*batch*).
  * **Interactive Syllabus Accordion:** Rincian materi belajar per pertemuan yang dapat dibuka-tutup beserta contoh hasil karya (*output project*) lulusan.
  * **Mentor Spotlight & Fast Enrollment Modal:** Profil praktisi pengajar dan formulir pendaftaran kelas yang terhubung langsung ke WhatsApp Admin.

### 4.4 Layanan 4: Computer Service
* **Konsep Layout:** *Hardware Diagnostic & Command Center Layout* (Fungsional, berfokus pada pelacakan status perbaikan dan diagnosa masalah cepat).
* **Fitur & Komponen Khusus:**
  * **Live Service Receipt Tracker (Cek Status Servis):** Kotak pencarian utama di bagian atas halaman. Pelanggan cukup memasukkan **Nomor Nota Servis** (contoh: `SRV-2026-0089`) untuk melihat progres perbaikan secara langsung:
    $$\text{Diterima \& Diagnosa} \rightarrow \text{Menunggu Sparepart} \rightarrow \text{Dalam Perbaikan} \rightarrow \text{Uji Fungsi (QC)} \rightarrow \text{Siap Diambil}$$
  * **Interactive Symptom Diagnostic (Cek Gejala Kerusakan):** Pengunjung memilih jenis perangkat (*Laptop, PC Rakitan, MacBook*) dan gejala kerusakan (*Mati Total, Overheat, Layar Bergaris, Upgrade SSD/RAM*) untuk melihat estimasi biaya dan waktu pengerjaan.
  * **Form Booking Antrean Servis / Panggil Teknisi.**

### 4.5 Layanan 5: Internship
* **Konsep Layout:** *Startup Talent & Career Portal Layout* (Dinamis, energik, menggunakan aksen *Nebula Violet* yang menarik bagi pelajar dan mahasiswa).
* **Fitur & Komponen Khusus:**
  * *(Catatan: Halaman ini terhubung baik dari menu utama "Internship" di Topbar maupun dari dropdown "Layanan $\rightarrow$ Internship").*
  * **Open Role Bento Cards:** Daftar divisi magang yang sedang dibuka (*Frontend/Backend Developer, Photographer/Videographer, Creative Designer, Hardware Technician*) dengan badge kuota dan tipe kerja (*Onsite / Hybrid*).
  * **Interactive Internship Journey Stepper:** Visualisasi alur magang di Langit mulai dari *Submit CV & Portofolio $\rightarrow$ Review & Interview $\rightarrow$ Onboarding $\rightarrow$ Real Client Project $\rightarrow$ Sertifikasi*.
  * **Direct Application Form with CV Upload:** Formulir lamaran magang langsung di halaman dengan fitur unggah CV (`.pdf`) dan tautan portofolio.

### 4.6 Layanan 6: Sewa Alat
* **Konsep Layout:** *Equipment Rental Marketplace & Catalog Layout* (Dilengkapi *sticky sidebar filter* dan sistem keranjang sewa berdasarkan tanggal).
* **Fitur & Komponen Khusus:**
  * **Real-Time Category & Availability Filter:** Filter cepat berdasarkan kategori (*Kamera, Lensa, Lighting, Audio, Gimbal/Stabilizer, Drone, Proyektor*) dan status stok (*Tersedia Hari Ini / Sedang Disewa*).
  * **Smart Date-Range Rental Cart (Keranjang Simulasi Sewa):** Pengunjung dapat memasukkan beberapa alat ke keranjang, memilih **Tanggal Ambil** dan **Tanggal Kembali**, lalu sistem otomatis menghitung:
    $$\text{Total Biaya} = \sum (\text{Harga Alat per Hari} \times \text{Jumlah Unit}) \times \text{Durasi Hari} - \text{Diskon Durasi}$$
  * **One-Click Booking & Syarat Sewa Modal:** Mengirimkan kode *booking* dan daftar alat langsung ke database Admin serta membuka chat WhatsApp otomatis.

### 4.7 Layanan 7: Kolaborasi
* **Konsep Layout:** *Executive B2B Partnership & Pitch Deck Layout* (Elegan, persuasif, dirancang untuk instansi, sekolah/kampus, brand, dan *Event Organizer*).
* **Fitur & Komponen Khusus:**
  * **Collaboration Scheme Cards:** Membedah model kerja sama yang tersedia (*Media Partner Event, Sponsorship, Kunjungan Industri/Kampus, White-Label Production Partner, Kolaborasi Konten*).
  * **Impact Metrics & Partner Marquee:** Animasi angka pencapaian kolaborasi Langit dan deretan logo mitra yang pernah bekerja sama.
  * **Proposal Dropzone Portal:** Formulir pengajuan kolaborasi yang dilengkapi fitur *drag-and-drop upload* dokumen **Proposal Kerja Sama (`.pdf`)** langsung ke dashboard Admin Langit.

---

## 5. Portal 1 (Public): Spesifikasi Menu Utama Lainnya di Headbar

Selain menu **Layanan** dan **Internship**, berikut adalah spesifikasi halaman untuk menu utama lainnya pada Headbar:

### 5.1 Menu "Portofolio" (All-in-One Showcase & Langit Photo Gallery)
* Berfungsi sebagai etalase pusat yang menggabungkan seluruh mahakarya lintas divisi Langit.
* **Fitur Utama:**
  * **Interactive Category Switcher:** Tab navigasi mulus tanpa *reload* untuk memilih: *Semua Karya*, *Langit Photo & Video Gallery*, *Proyek Website & Aplikasi*, serta *Dokumentasi Event & Edukasi*.
  * **Case Study Deep-Dive Modal/Page:** Untuk proyek besar, pengunjung dapat membaca latar belakang masalah klien, solusi lintas divisi yang diberikan Langit, hingga hasil akhirnya.

### 5.2 Menu "Kontak" (Interactive Communication Hub)
* **Direct Division Contact Cards:** Kartu kontak cepat yang mengarahkan pengunjung ke admin divisi terkait (misal: CS Sewa Alat vs CS Pembuatan Web).
* **Interactive Studio Map & Operational Hours:** Peta lokasi studio/kantor Langit dengan indikator status *Real-time* (*"Studio Sedang Buka"* atau *"Tutup — Buka Kembali Besok 09.00"*).
* **Dynamic FAQ Accordion:** Pertanyaan yang sering diajukan beserta filter topik.

### 5.3 Menu "Konsultasi" (3-Step Interactive Consultation Wizard)
Berbeda dari halaman kontak biasa, tombol **Konsultasi** di kanan atas Headbar membuka halaman interaktif berbentuk **Panduan 3 Langkah (Wizard)**:
1. **Langkah 1 — Pilih Topik Kebutuhan:** Pengunjung memilih kartu topik (*Pembuatan Website, Produksi Foto/Video, Pengadaan/Servis Komputer, Pelatihan/Edukasi, atau Kerja Sama Khusus*).
2. **Langkah 2 — Pilih Metode & Jadwal:** Memilih sesi *Online Meeting (Google Meet / WhatsApp Call)* atau *Tatap Muka di Studio Langit*, lalu memilih tanggal dan slot jam yang tersedia.
3. **Langkah 3 — Rincian Singkat & Konfirmasi:** Mengisi nama, instansi, nomor WhatsApp, dan deskripsi singkat proyek $\rightarrow$ Sistem mengeluarkan **Tiket Jadwal Konsultasi**.

---

## 6. Portal 2: Admin Dashboard & CMS Back-Office

Portal Admin (`/admin`) dilindungi oleh autentikasi Laravel 13 dan dirancang agar tim Langit dapat mengelola seluruh 7 layanan serta konten galeri dengan mudah:

1. **Executive Dashboard & Analytics:**
   * Ringkasan metrik harian/bulanan: Total kunjungan, *leads* konsultasi masuk, jumlah alat yang sedang disewa hari ini, tiket servis komputer yang belum selesai, dan pelamar *internship* baru.
2. **Langit Photo Gallery & Media Engine:**
   * *Bulk Drag-and-Drop Uploader* untuk mengunggah puluhan foto sekaligus.
   * **Automated WebP & Compression Queue:** Setiap foto yang diunggah otomatis dikonversi menjadi `.webp` ringan oleh *server* beserta ekstraksi data EXIF kamera otomatis (jika tersedia di metadata file foto).
   * Pengaturan pasangan foto *Before/After* untuk halaman Photography.
3. **Manajemen Layanan & Portofolio Web:**
   * Mengelola daftar proyek website, tautan *live preview*, *tech stack*, serta variabel harga untuk fitur *Web Price Estimator*.
4. **Manajemen Inventaris Sewa Alat & Booking:**
   * CRUD katalog alat sewa, pengaturan harga per 24 jam, jumlah stok tersedia, dan persetujuan pesanan sewa (*Pending $\rightarrow$ Approved $\rightarrow$ Picked Up $\rightarrow$ Returned*).
5. **Manajemen Tiket Computer Service:**
   * Membuat nota servis baru (`SRV-XXXX`), memperbarui tahapan perbaikan agar pelanggan dapat memantaunya secara *live* di web, serta mencetak struk/nota servis.
6. **Manajemen Kelas Education & Rekrutmen Internship:**
   * Membuka/menutup kuota kelas dan posisi magang, serta melihat/mengunduh berkas CV (`.pdf`) pelamar magang langsung dari tabel Admin.
7. **Inbox Kolaborasi & Jadwal Konsultasi:**
   * Mengunduh file proposal PDF dari calon mitra kolaborasi dan mengelola jadwal janji temu dari halaman Konsultasi dengan tombol *One-Click WhatsApp Follow-Up*.

---

## 7. Rancangan Skema Database MySQL (Dikelola via phpMyAdmin)

Seluruh tabel berikut dibuat menggunakan *Laravel 13 Migrations* dengan relasi *Foreign Key* yang terstruktur dan dapat dikelola melalui **phpMyAdmin**:

### 7.1 Tabel Inti & Konfigurasi Layanan
* **`users`**
  * `id` (PK), `name`, `email` (Unique), `password`, `role` (`superadmin`, `admin_visual`, `admin_tech`, `admin_rental`), `avatar`, `timestamps`.
* **`services`**
  * `id` (PK), `name`, `slug` (Unique: `photography-videography`, `web-development`, `langit-education`, `computer-service`, `internship`, `sewa-alat`, `kolaborasi`), `tagline`, `accent_color`, `icon_svg`, `hero_config_json`, `is_active`, `timestamps`.

### 7.2 Tabel Galeri Foto, Portofolio & Web Estimator
* **`galleries`** *(Langit Photo & Video Gallery)*
  * `id` (PK), `service_id` (FK), `title`, `slug`, `category` (`wedding`, `commercial`, `product`, `drone`, `event`), `media_type` (`photo`, `video`, `before_after`), `file_webp_path`, `before_file_path` (Nullable), `video_url` (Nullable), `exif_metadata_json` (Camera, Lens, ISO, Shutter, Aperture), `is_featured` (Boolean), `timestamps`.
* **`web_portfolios`**
  * `id` (PK), `title`, `slug`, `client_name`, `project_url`, `desktop_preview_img`, `mobile_preview_img`, `tech_stack_json`, `lighthouse_score`, `challenge_text`, `solution_text`, `timestamps`.
* **`web_estimator_components`**
  * `id` (PK), `component_name`, `category`, `base_price`, `estimated_days`, `is_active`, `timestamps`.

### 7.3 Tabel Operasional Layanan Spesifik
* **`education_courses`**
  * `id` (PK), `title`, `slug`, `level` (`beginner`, `intermediate`, `advanced`), `duration_text`, `price`, `quota`, `syllabus_json`, `mentor_name`, `mentor_role`, `is_open`, `timestamps`.
* **`education_registrations`**
  * `id` (PK), `course_id` (FK), `student_name`, `email`, `whatsapp`, `notes`, `status` (`pending`, `confirmed`, `completed`), `timestamps`.
* **`computer_service_tickets`**
  * `id` (PK), `receipt_number` (Unique, e.g., `SRV-2026-001`), `customer_name`, `whatsapp`, `device_type`, `device_brand_model`, `problem_reported`, `diagnosis_result`, `status` (`received`, `waiting_part`, `repairing`, `qc_testing`, `ready`, `completed`), `estimated_cost`, `final_cost`, `timestamps`.
* **`rental_equipments`** *(Katalog Sewa Alat)*
  * `id` (PK), `name`, `slug`, `brand`, `category` (`camera`, `lens`, `lighting`, `audio`, `stabilizer`, `drone`, `other`), `price_per_day`, `stock_total`, `stock_available`, `thumbnail_webp`, `specs_json`, `is_active`, `timestamps`.
* **`rental_bookings`**
  * `id` (PK), `booking_code` (Unique, e.g., `RNT-2026-001`), `customer_name`, `whatsapp`, `identity_card_type`, `start_date`, `end_date`, `total_days`, `rented_items_json`, `total_price`, `status` (`pending`, `approved`, `picked_up`, `returned`, `cancelled`), `timestamps`.
* **`internship_positions`**
  * `id` (PK), `title`, `slug`, `division_name`, `work_type` (`onsite`, `hybrid`, `remote`), `quota`, `duration_months`, `requirements_json`, `benefits_json`, `is_open`, `timestamps`.
* **`internship_applications`**
  * `id` (PK), `position_id` (FK), `full_name`, `institution_name`, `major`, `email`, `whatsapp`, `cv_pdf_path`, `portfolio_url`, `motivation_letter`, `status` (`submitted`, `reviewed`, `interview`, `accepted`, `rejected`), `timestamps`.
* **`collaborations`**
  * `id` (PK), `organization_name`, `pic_name`, `email`, `whatsapp`, `collab_type` (`media_partner`, `sponsorship`, `campus_visit`, `b2b_project`, `other`), `event_date`, `proposal_pdf_path`, `description`, `status` (`new`, `in_discussion`, `approved`, `declined`), `timestamps`.
* **`consultations`**
  * `id` (PK), `ticket_code` (Unique, e.g., `CNS-2026-001`), `client_name`, `company_or_institution`, `whatsapp`, `email`, `service_topic`, `meeting_method` (`online_meet`, `offline_studio`), `preferred_date`, `preferred_time`, `project_brief`, `budget_estimation`, `status` (`scheduled`, `completed`, `rescheduled`, `cancelled`), `timestamps`.

---

## 8. Struktur RoutingAplikasi (Laravel 13 + Inertia React)

### 8.1 Public Routes (`routes/web.php`)
* `GET /` $\rightarrow$ `HomeController@index` (Beranda Utama, Bento Hero, Ringkasan Ekosistem)
* **Dropdown Layanan (7 Distinct Views):**
  * `GET /layanan/photography-videography` $\rightarrow$ Render `Pages/Services/PhotoVideoView.jsx`
  * `GET /layanan/web-development` $\rightarrow$ Render `Pages/Services/WebDevView.jsx`
  * `GET /layanan/langit-education` $\rightarrow$ Render `Pages/Services/EducationView.jsx`
  * `GET /layanan/computer-service` $\rightarrow$ Render `Pages/Services/ComputerServiceView.jsx`
  * `GET /layanan/internship` $\rightarrow$ Render `Pages/Services/InternshipView.jsx`
  * `GET /layanan/sewa-alat` $\rightarrow$ Render `Pages/Services/RentalEquipmentView.jsx`
  * `GET /layanan/kolaborasi` $\rightarrow$ Render `Pages/Services/CollaborationView.jsx`
* **Menu Utama Topbar Lainnya:**
  * `GET /portofolio` $\rightarrow$ Render `Pages/Portfolio/Index.jsx` (Hub Karya & Langit Photo Gallery)
  * `GET /internship` $\rightarrow$ Redirect atau Render langsung `Pages/Services/InternshipView.jsx`
  * `GET /kontak` $\rightarrow$ Render `Pages/Contact/Index.jsx`
  * `GET /konsultasi` $\rightarrow$ Render `Pages/Consultation/Wizard.jsx`
* **Interactive Action Endpoints (POST/GET):**
  * `GET /api/service-tracker/{receipt_number}` $\rightarrow$ Cek status servis komputer secara *real-time*.
  * `POST /sewa-alat/checkout` $\rightarrow$ Simpan *booking* sewa alat & generate pesan WhatsApp.
  * `POST /internship/apply` $\rightarrow$ Unggah CV PDF & simpan lamaran magang.
  * `POST /kolaborasi/submit` $\rightarrow$ Unggah Proposal PDF & simpan pengajuan kolaborasi.
  * `POST /konsultasi/book` $\rightarrow$ Simpan jadwal konsultasi dari *3-Step Wizard*.

### 8.2 Admin Portal Routes (`prefix: /admin`, Middleware: `auth, role:admin`)
* `GET /admin/dashboard` $\rightarrow$ Statistik & Ringkasan Aktivitas.
* `RESOURCE /admin/galleries` $\rightarrow$ CRUD Galeri Foto Langit & Auto-WebP Uploader.
* `RESOURCE /admin/web-portfolios` $\rightarrow$ CRUD Portofolio Web & Komponen Kalkulator Web.
* `RESOURCE /admin/education` $\rightarrow$ CRUD Kelas & Data Pendaftar Kursus.
* `RESOURCE /admin/computer-services` $\rightarrow$ CRUD Nota Servis & Update Status Perbaikan.
* `RESOURCE /admin/rentals` $\rightarrow$ CRUD Alat Sewa & Approval Booking Sewa.
* `RESOURCE /admin/internships` $\rightarrow$ CRUD Kuota Magang & Review CV Pelamar.
* `RESOURCE /admin/collaborations` $\rightarrow$ Manajemen Proposal Masuk.
* `RESOURCE /admin/consultations` $\rightarrow$ Manajemen Jadwal Konsultasi Klien.

---

## 9. Standar Non-Fungsional (Performa, Keamanan & SEO)

1. **Performa & Kecepatan Akses:**
   * Penggunaan **Vite Bundle Splitting** agar pengunjung yang hanya membuka halaman *Sewa Alat* tidak perlu mengunduh komponen milik halaman *Web Development* atau *Admin Dashboard*.
   * Seluruh foto di **Langit Photo Gallery** disajikan dalam format `.webp` dengan ukuran maksimal $150\text{ KB}$ untuk tampilan *grid* dan maksimal $400\text{ KB}$ untuk tampilan *Lightbox Full HD*.
2. **Keamanan Sistem (Laravel 13 Security Standards):**
   * Validasi ketat untuk unggahan berkas publik: Berkas CV (Internship) dan Proposal (Kolaborasi) wajib berformat `.pdf` dengan ukuran maksimal $5\text{ MB}$ serta disimpan di *non-public storage* yang dipindai MIME-type-nya.
   * Penerapan **Rate Limiting** (`throttle:5,1`) pada fitur pengecekan resi servis komputer dan pengajuan formulir untuk mencegah serangan *brute-force* dan *spam*.
3. **Technical SEO & Meta Tag Dinamis:**
   * Setiap halaman dari 7 layanan memiliki *Meta Title*, *Meta Description*, dan *OpenGraph Image* tersendiri menggunakan komponen `<Head>` dari Inertia React agar tampil profesional ketika tautannya dibagikan di WhatsApp atau media sosial.