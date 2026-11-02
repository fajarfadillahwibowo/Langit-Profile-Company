<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('Contact/Index', [
            'contacts' => [
                'general_email' => 'langitbelitang@gmail.com',
                'general_phone' => '+62 822-4614-2791',
                'whatsapp' => '+62 822-4614-2791',
                'tiktok_url' => 'https://www.tiktok.com/@langit.creative1?_r=1&_t=ZS-9An84b3f2BC',
                'tiktok_handle' => '@langit.creative1',
                'instagram_url' => 'https://www.instagram.com/langit.creative?cplk=MTcxN3d5aXB1c2hkMQ==',
                'instagram_handle' => '@langit.creative',
                'address' => 'Langit Office, Jl. Irigasi Bk 10, Tugu Harum, Kec. Belitang Madang Raya, Kabupaten Ogan Komering Ulu Timur, Sumatera Selatan 32382',
                'google_maps_url' => 'https://maps.app.goo.gl/tiByDRcJAGqN7gjm8?g_st=iw',
                'coordinates' => ['lat' => -4.0177, 'lng' => 104.6644],
                'opening_hours' => [
                    'monday_friday' => '09:00 - 18:00 WIB',
                    'saturday' => '10:00 - 16:00 WIB',
                    'sunday' => 'Emergency Service Only (Call)',
                ],
                'division_contacts' => [
                    ['division' => 'Creative & Visual', 'pic' => 'Admin Visual', 'phone' => '+62 822-4614-2791', 'tag' => 'Photo / Video / Drone'],
                    ['division' => 'Web & Engineering', 'pic' => 'Admin Tech', 'phone' => '+62 822-4614-2791', 'tag' => 'Software & Website'],
                    ['division' => 'Rental Gear & Studio', 'pic' => 'Admin Rental', 'phone' => '+62 822-4614-2791', 'tag' => 'Sewa Kamera & Lampu'],
                    ['division' => 'Computer Lab', 'pic' => 'Teknisi Lab', 'phone' => '+62 822-4614-2791', 'tag' => 'Servis & Diagnostik'],
                ]
            ],
            'faqs' => [
                [
                    'category' => 'Photo & Video',
                    'question' => 'Bagaimana proses pemesanan sesi foto/video dan pengambilan hasilnya?',
                    'answer' => 'Anda dapat berkonsultasi mengenai jadwal dan konsep photoshoot (Wedding, Wisuda, Event, dll) via WhatsApp atau menu Konsultasi. Setelah sesi selesai dan proses editing rampung, hasil foto resolusi penuh dapat diunduh langsung melalui Portal Pelanggan Studio Langit menggunakan akun yang diberikan oleh admin.'
                ],
                [
                    'category' => 'Photo & Video',
                    'question' => 'Apakah hasil foto dan video yang diberikan berkualitas resolusi penuh (High Definition)?',
                    'answer' => 'Ya, seluruh berkas foto dan video diserahkan dalam resolusi asli tanpa kompresi paksa. Anda juga dapat mengunduh seluruh file dalam satu paket arsip ZIP atau mengunduh foto pilihan secara satuan dengan kecepatan maksimal.'
                ],
                [
                    'category' => 'Website',
                    'question' => 'Berapa lama estimasi pembuatan website dan apakah ada garansi pemeliharaan?',
                    'answer' => 'Estimasi waktu pengerjaan berkisar antara 7 hingga 30 hari kerja tergantung kompleksitas website (Company Profile, Toko Online, atau Sistem Informasi Kustom). Setiap proyek dilengkapi garansi teknis perbaikan bug, pemeliharaan rutin, serta optimasi performa berkecepatan tinggi.'
                ],
                [
                    'category' => 'Internship',
                    'question' => 'Apakah Studio Langit menerima program magang / PKL untuk siswa SMK dan mahasiswa?',
                    'answer' => 'Tentu! Kami membuka program Internship & PKL industri resmi secara berkala di bidang Fotografi, Videografi, Web Development, Desain Grafis, dan IT Support. Pendaftaran dapat diajukan langsung melalui halaman Layanan Magang.'
                ],
                [
                    'category' => 'Education',
                    'question' => 'Program pelatihan atau kursus apa saja yang tersedia di Langit Education?',
                    'answer' => 'Langit Education menyediakan pelatihan praktis intensif, meliputi Kursus Web Development & Coding (pemula hingga mahir), Dasar Artificial Intelligence (AI), Perakitan PC & Hardware Komputer, serta pelatihan aplikasi perkantoran untuk persiapan dunia kerja.'
                ],
                [
                    'category' => 'Servis Komputer',
                    'question' => 'Berapa biaya pengecekan awal untuk perbaikan laptop atau komputer?',
                    'answer' => 'Pengecekan dan diagnosa awal di workshop Lab Langit 100% Gratis. Biaya hanya dikenakan setelah teknisi mengonfirmasi kendala dan Anda menyetujui rincian perbaikan serta estimasi biaya di awal.'
                ],
                [
                    'category' => 'Sewa Alat',
                    'question' => 'Apa syarat untuk menyewa kamera, lensa, atau perlengkapan studio?',
                    'answer' => 'Penyewa cukup menunjukkan dan menitipkan kartu identitas asli yang sah (KTP / SIM / KTM) serta mengisi formulir sewa. Kami menyediakan bodi kamera, lensa sinema, drone, tata cahaya (lighting), hingga perangkat audio berkualitas profesional.'
                ],
            ]
        ]);
    }
}
