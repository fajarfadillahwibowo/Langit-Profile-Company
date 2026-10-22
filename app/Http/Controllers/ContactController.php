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
                'general_email' => 'halo@langit.id',
                'general_phone' => '+62 812 3456 7890',
                'address' => 'Langit Office, Jl. Irigasi Bk 10, Tugu Harum, Kec. Belitang Madang Raya, Kabupaten Ogan Komering Ulu Timur, Sumatera Selatan 32382',
                'google_maps_url' => 'https://maps.app.goo.gl/tiByDRcJAGqN7gjm8?g_st=iw',
                'coordinates' => ['lat' => -4.0177, 'lng' => 104.6644],
                'opening_hours' => [
                    'monday_friday' => '09:00 - 18:00 WIB',
                    'saturday' => '10:00 - 16:00 WIB',
                    'sunday' => 'Emergency Service Only (Call)',
                ],
                'division_contacts' => [
                    ['division' => 'Creative & Visual', 'pic' => 'Admin Visual', 'phone' => '+62 812 3456 7891', 'tag' => 'Photo / Video / Drone'],
                    ['division' => 'Web & Engineering', 'pic' => 'Admin Tech', 'phone' => '+62 812 3456 7892', 'tag' => 'Software & Website'],
                    ['division' => 'Rental Gear & Studio', 'pic' => 'Admin Rental', 'phone' => '+62 812 3456 7893', 'tag' => 'Sewa Kamera & Lampu'],
                    ['division' => 'Computer Lab', 'pic' => 'Teknisi Lab', 'phone' => '+62 812 3456 7894', 'tag' => 'Servis & Diagnostik'],
                ]
            ],
            'faqs' => [
                [
                    'question' => 'Bagaimana alur penyewaan alat di Langit?',
                    'answer' => 'Anda dapat memilih alat di katalog Sewa Alat, tentukan tanggal sewa, lalu klik Booking. Tim kami akan menyiapkan invoice dan konfirmasi syarat jaminan (KTP/SIM asli). Pengambilan alat dapat dilakukan di studio Langit atau dikirim kurir instan.'
                ],
                [
                    'question' => 'Apakah bisa melacak progres servis komputer secara online?',
                    'answer' => 'Bisa! Setiap unit yang masuk akan mendapatkan Nomor Nota Servis (misal SRV-2026-0089). Anda dapat memasukkannya di halaman Computer Service untuk memantau status diagnosa, perbaikan, hingga uji kelayakan secara real-time.'
                ],
                [
                    'question' => 'Apakah ada garansi untuk proyek pembuatan website?',
                    'answer' => 'Ya, kami memberikan garansi pemeliharaan teknis & perbaikan bug selama 3 hingga 6 bulan penuh (tergantung paket), serta jaminan performa Google Lighthouse di atas 90.'
                ],
                [
                    'question' => 'Apakah menerima program magang (internship) untuk siswa SMK dan mahasiswa?',
                    'answer' => 'Tentu! Kami membuka batch magang secara berkala di divisi Web, Fotografi/Videografi, dan Servis Komputer. Silakan cek posisi yang aktif di halaman Internship.'
                ],
            ]
        ]);
    }
}
