# 🐳 Panduan Lengkap Setup VPS dengan Docker — Langit Profile Company

Panduan ini berisi langkah-langkah lengkap dan mudah dipahami untuk melakukan setup dan deployment website **Langit Profile Company** pada Virtual Private Server (VPS) menggunakan Docker & Docker Compose.

---

## 🏗️ Arsitektur Kontainer Produksi

Konfigurasi Docker ini telah dioptimalkan khusus untuk produksi Laravel 12 + Inertia React (Vite):
- **`app`**: PHP 8.4 FPM (Alpine Linux) dengan ekstensi lengkap (GD WebP, Exif, OPcache, Redis, Pdo, Zip, BCMath) & batas upload hingga **128MB** (cocok untuk showreel video 4K & foto resolusi tinggi).
- **`web`**: Nginx 1.27 Alpine berkecepatan tinggi dengan Gzip compression, HTTP caching static assets, dan proteksi security headers.
- **`db`**: MariaDB 10.11 LTS (kompatibel penuh dengan MySQL, sangat hemat RAM untuk VPS 1GB/2GB).
- **`redis`**: In-memory store untuk Session, Cache, dan Queue worker berkinerja tinggi.
- **`queue`**: Background worker otomatis untuk memproses task antrean / email secara asinkron.
- **`cron`**: Scheduler otomatis yang menjalankan tugas berkala Laravel setiap menit.

---

## 💻 Prasyarat VPS

- **Sistem Operasi**: Ubuntu 22.04 LTS / 24.04 LTS atau Debian 12 (direkomendasikan).
- **Spesifikasi Minimal**: 1 vCPU, 1 GB RAM (disarankan 2 GB RAM atau aktifkan 2 GB Swap).
- **Akses**: Root / Sudo privilege via SSH.

---

## 🚀 Langkah 1: Persiapan Server VPS

Hubungkan SSH ke VPS Anda:
```bash
ssh root@IP_SERVER_ANDA
```

Update package dan install dependensi dasar (Git & Curl):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw
```

Install Docker & Docker Compose resmi:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Buka firewall untuk HTTP & HTTPS:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## 📥 Langkah 2: Clone Repository

Clone repositori proyek ke direktori server (misal `/var/www/langit`):
```bash
cd /var/www
git clone https://github.com/fajarfadillahwibowo/Langit-Profile-Company.git langit
cd langit
```

---

## ⚙️ Langkah 3: Konfigurasi Environment (`.env`)

Salin template konfigurasi Docker:
```bash
cp .env.docker.example .env
```

Buka dan sesuaikan `.env` menggunakan nano:
```bash
nano .env
```
Hal penting yang perlu disesuaikan:
1. `APP_URL`: Ubah ke domain Anda, contoh: `https://langit.id` (atau `http://IP_SERVER_ANDA`).
2. `DB_PASSWORD` & `DB_ROOT_PASSWORD`: Ganti dengan password database yang aman.
3. `SEED_ON_DEPLOY=true`: Biarkan `true` pada deployment pertama agar akun admin dan seluruh konten default terisi otomatis.

Simpan dengan menekan `CTRL + O`, lalu `ENTER`, dan keluar dengan `CTRL + X`.

---

## 🚢 Langkah 4: Jalankan Deployment Otomatis

Jalankan script deploy otomatis yang telah disediakan:
```bash
chmod +x deploy.sh
./deploy.sh
```
*Atau jalankan manual melalui Docker Compose:*
```bash
docker compose up -d --build
```

Setelah proses build selesai, buka browser Anda:
- **Website Publik**: `http://IP_SERVER_ANDA`
- **Login Admin CMS**: `http://IP_SERVER_ANDA/admin/login`
- **Email Admin**: `admin@langit.id`
- **Password Default**: `admin123`

---

## 🔒 Langkah 5: Setup Domain & SSL Gratis (HTTPS / Let's Encrypt)

Jika Anda sudah mengarahkan A-Record domain ke IP VPS:

### Opsi A: Menggunakan Cloudflare (Paling Mudah & Cepat)
1. Arahkan domain ke IP VPS di Cloudflare DNS.
2. Aktifkan proxy orange Cloudflare.
3. Pada tab **SSL/TLS**, pilih mode **Flexible** atau **Full**.
4. Website Anda langsung aktif dengan HTTPS tanpa konfigurasi sertifikat manual di server.

### Opsi B: Menggunakan Certbot Standalone di Nginx Container
```bash
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    -d domainanda.com -d www.domainanda.com \
    --email emailanda@gmail.com --agree-tos --no-eff-email" web
```

---

## 🛠️ Perintah Berguna untuk Maintenance

### Melihat Log Realtime:
```bash
# Log seluruh kontainer
docker compose logs -f

# Log hanya aplikasi Laravel / PHP
docker compose logs -f app

# Log web server Nginx
docker compose logs -f web
```

### Menjalankan Perintah Artisan:
```bash
# Masuk ke Tinker
docker compose exec app php artisan tinker

# Clear & Re-cache konfigurasi
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan optimize

# Migrasi database
docker compose exec app php artisan migrate --force
```

### Mengganti Password Admin:
```bash
docker compose exec app php artisan tinker --execute "App\Models\User::where('email', 'admin@langit.id')->first()->update(['password' => Hash::make('PasswordBaru123!')]);"
```

### Backup Database MariaDB:
```bash
docker compose exec db mysqldump -u langit_user -plangit_secret_pass_2026 langit_db > backup_langit_$(date +%F).sql
```

### Update Kode Terbaru dari GitHub:
```bash
git pull origin main
docker compose up -d --build
docker compose exec app php artisan optimize
```

### Restart Semua Kontainer:
```bash
docker compose restart
```

---
*Langit Profile Company — Docker Production Suite v2.0*
