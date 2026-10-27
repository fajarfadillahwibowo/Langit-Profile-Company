#!/bin/bash
# ==========================================================
# Automated Production VPS Deployment Script for Langit
# ==========================================================

set -e

echo "=========================================================="
echo "  🚀 Memulai Deployment Langit Profile Company di VPS...  "
echo "=========================================================="

# 1. Periksa ketersediaan Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker belum terinstal di server ini."
    echo "Jalankan perintah ini di Ubuntu/Debian untuk install Docker:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# 2. Periksa file .env
if [ ! -f .env ]; then
    echo "⚙️  File .env tidak ditemukan. Menyalin dari .env.docker.example..."
    cp .env.docker.example .env
    echo "⚠️  Catatan: Pastikan periksa dan sesuaikan APP_URL dan password database di .env"
fi

# 3. Build & Run Docker Containers
echo "📦 Membangun Docker Image dan Menjalankan Service (Nginx, PHP 8.4, DB, Redis, Queue)..."
docker compose down || true
docker compose up -d --build

# 4. Tunggu container siap
echo "⏳ Menunggu container database dan service siap..."
sleep 10

# 5. Tampilkan Status Container
echo "=========================================================="
echo "  ✅ Status Container Docker:                             "
echo "=========================================================="
docker compose ps

echo "=========================================================="
echo "  🎉 Deployment Berhasil Selesai!                         "
echo "=========================================================="
echo "🌐 Akses Website:   http://$(curl -s ifconfig.me || echo 'IP_SERVER_ANDA')"
echo "🔐 Portal Admin:    http://$(curl -s ifconfig.me || echo 'IP_SERVER_ANDA')/admin/login"
echo "👤 Akun Superadmin: admin@langit.id"
echo "🔑 Password Default: admin123"
echo "=========================================================="
