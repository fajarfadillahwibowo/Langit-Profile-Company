<?php

namespace Database\Seeders;

use App\Models\Collaboration;
use App\Models\ComputerServiceTicket;
use App\Models\Consultation;
use App\Models\EducationCourse;
use App\Models\Gallery;
use App\Models\InternshipPosition;
use App\Models\RentalEquipment;
use App\Models\Service;
use App\Models\User;
use App\Models\WebEstimatorComponent;
use App\Models\WebPortfolio;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Superadmin User
        User::updateOrCreate(
            ['email' => 'admin@langit.id'],
            [
                'name' => 'Langit Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'superadmin',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            ]
        );

        // 2. 7 Services
        $services = [
            [
                'name' => 'Photography & Videography',
                'slug' => 'photography-videography',
                'tagline' => 'Wedding, Wisuda, Event, Traveling, Drone & Cinema',
                'description' => 'Wedding, Wisuda, Event, Traveling, Drone & Cinema, serta kalibrasi warna presisi standar sinema.',
                'image_url' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Visual & Cinema',
                'ribbon_text' => 'GOLD',
                'serial_number' => '2281 ••••',
                'tags' => ['Sony FX3 Cinema', '4K Aerial Drone', 'Color Grading'],
                'accent_color' => '#EAB308',
                'icon_svg' => 'Camera',
                'hero_config_json' => [
                    'badge' => 'Visual & Cinema Studio',
                    'subtitle' => 'Layanan dokumentasi lengkap: Wedding sinematik, wisuda portrait, liputan event, dokumentasi traveling, jasa drone aerial 4K, dan video company profile korporat.',
                    'bg_theme' => '#050507',
                ],
            ],
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'tagline' => 'Operasi Internal, Company Profile, Portal Pendidikan',
                'description' => 'Operasi Internal, Company Profile, Portal Pendidikan, SPA 0ms reload, dan skor Lighthouse 99+.',
                'image_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Cyber Architecture',
                'ribbon_text' => 'CYBER',
                'serial_number' => '2282 ••••',
                'tags' => ['Laravel 13 & React 19', '0ms Page Reload', 'Lighthouse 99+'],
                'accent_color' => '#0EA5E9',
                'icon_svg' => 'Code2',
                'hero_config_json' => [
                    'badge' => 'Cyber Architecture & Scalable Web',
                    'subtitle' => 'Pengembangan website operasi internal perusahaan, profil perusahaan modern, website pendidikan (absensi & akademik), toko online, dan web kustom.',
                    'bg_theme' => '#060B14',
                ],
            ],
            [
                'name' => 'Langit Education',
                'slug' => 'langit-education',
                'tagline' => 'Kursus Coding (Robotik/Web/AI), Office & Rakit Komputer',
                'description' => 'Kursus Coding (Robotik/Web/AI), Office, Rakit PC, dan sertifikasi keahlian vokasi digital bersertifikat.',
                'image_url' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Academy & Training',
                'ribbon_text' => 'PRO',
                'serial_number' => '2283 ••••',
                'tags' => ['Robotik & AI Lab', 'Sertifikat Resmi', 'Praktik Industri'],
                'accent_color' => '#16A34A',
                'icon_svg' => 'GraduationCap',
                'hero_config_json' => [
                    'badge' => 'Practical Tech & Creative Academy',
                    'subtitle' => 'Pelatihan praktis bersertifikat: Kursus Coding (Robotik, Web Dev, AI), Kursus Administrasi Office, dan Kursus Rakit Komputer & Diagnostic Lab.',
                    'bg_theme' => '#04100D',
                ],
            ],
            [
                'name' => 'Computer Service',
                'slug' => 'computer-service',
                'tagline' => 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart',
                'description' => 'Installasi Software, Upgrade SSD, Rakit PC & Sparepart, perbaikan spesialis bergaransi resmi.',
                'image_url' => 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Hardware Lab',
                'ribbon_text' => 'QC 99%',
                'serial_number' => '2284 ••••',
                'tags' => ['Sparepart Original', 'QC 99% Teruji', 'Garansi Resmi'],
                'accent_color' => '#EA580C',
                'icon_svg' => 'Cpu',
                'hero_config_json' => [
                    'badge' => 'Precision Hardware Lab & Recovery',
                    'subtitle' => 'Reparasi dan tuning hardware: Installasi software clean OS, upgrade SSD NVMe cepat, jasa rakit PC custom estetik, dan penggantian sparepart bergaransi.',
                    'bg_theme' => '#120A05',
                ],
            ],
            [
                'name' => 'Internship',
                'slug' => 'internship',
                'tagline' => 'Form Pendaftaran Magang / PKL Industri & Inkubasi',
                'description' => 'Form Pendaftaran Magang / PKL Industri & Inkubasi nyata untuk mahasiswa dan siswa berprestasi.',
                'image_url' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Career Hub',
                'ribbon_text' => 'ELITE',
                'serial_number' => '2285 ••••',
                'tags' => ['Proyek Klien Riil', 'Akses Studio Lab', 'Portofolio Resmi'],
                'accent_color' => '#8B5CF6',
                'icon_svg' => 'Sparkles',
                'hero_config_json' => [
                    'badge' => 'Next-Gen Talent Incubator',
                    'subtitle' => 'Pendaftaran program magang & PKL industri nyata untuk mahasiswa dan siswa berprestasi di divisi Web Dev, Multimedia/Drone, dan Hardware Lab.',
                    'bg_theme' => '#0B0716',
                ],
            ],
            [
                'name' => 'Sewa Alat',
                'slug' => 'sewa-alat',
                'tagline' => 'Rental Proyektor + Screen, Smart TV Display & Drone 4K',
                'description' => 'Rental Proyektor + Screen, Smart TV Display & Drone 4K, kamera Sony Cinema Line, dan gear studio.',
                'image_url' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Rental Gear',
                'ribbon_text' => 'READY',
                'serial_number' => '2286 ••••',
                'tags' => ['Unit Terawat Siap Pakai', 'Kalibrasi Presisi', 'Paket Lengkap'],
                'accent_color' => '#06B6D4',
                'icon_svg' => 'PackageCheck',
                'hero_config_json' => [
                    'badge' => 'Pro Event & Presentation Gear',
                    'subtitle' => 'Penyewaan proyektor lumens tinggi + screen tripod, Smart TV 55"/65" dengan standing bracket beroda untuk pameran, serta drone aerial 4K siap pakai.',
                    'bg_theme' => '#051110',
                ],
            ],
            [
                'name' => 'Kolaborasi',
                'slug' => 'kolaborasi',
                'tagline' => 'Kemitraan Kampus, Sponsor Event & Vendor B2B',
                'description' => 'Kemitraan Kampus, Sponsor Event & Vendor B2B, sinergi pengadaan IT serta kerja sama strategis.',
                'image_url' => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
                'vip_label' => 'Strategic Partner',
                'ribbon_text' => 'ALLIANCE',
                'serial_number' => '2287 ••••',
                'tags' => ['MoU Resmi', 'Co-Branding', 'Sinergi B2B Terpadu'],
                'accent_color' => '#EC4899',
                'icon_svg' => 'Handshake',
                'hero_config_json' => [
                    'badge' => 'Strategic Ecosystem Partnership',
                    'subtitle' => 'Kolaborasi kemitraan institusi kampus/SMK, sponsorship acara kreatif, media partner, serta kerjasama vendor subkontrak proyek B2B.',
                    'bg_theme' => '#12050D',
                ],
            ],
        ];

        $serviceMap = [];
        foreach ($services as $srv) {
            $created = Service::updateOrCreate(['slug' => $srv['slug']], $srv);
            $serviceMap[$srv['slug']] = $created->id;
        }

        // 3. Langit Photo Galleries with EXIF matching: Wedding, Wisuda, Event, Traveling, Jasa Drone, Company Profile
        $galleries = [
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Royal Heritage Wedding Cinematic & Photo',
                'slug' => 'royal-heritage-wedding-cinematic',
                'category' => 'wedding',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony A7 IV',
                    'lens' => 'FE 85mm F1.4 GM',
                    'focal_length' => '85mm',
                    'shutter' => '1/800s',
                    'aperture' => 'f/1.4',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Wisuda Sarjana & Magister Studio Portrait',
                'slug' => 'wisuda-sarjana-magister-portrait',
                'category' => 'wisuda',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony A7R V',
                    'lens' => 'FE 50mm F1.2 GM',
                    'focal_length' => '50mm',
                    'shutter' => '1/250s',
                    'aperture' => 'f/2.0',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'National Music Festival & Corporate Gathering',
                'slug' => 'national-music-festival-event',
                'category' => 'event',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony FX3 Cinema Line',
                    'lens' => 'FE 70-200mm F2.8 GM OSS II',
                    'focal_length' => '135mm',
                    'shutter' => '1/500s',
                    'aperture' => 'f/2.8',
                    'iso' => '2500',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Tropical Island Traveling & Adventure Reel',
                'slug' => 'tropical-island-traveling-adventure',
                'category' => 'traveling',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony A7 IV',
                    'lens' => 'FE 16-35mm F2.8 GM II',
                    'focal_length' => '20mm',
                    'shutter' => '1/1000s',
                    'aperture' => 'f/4.0',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Jasa Drone Aerial Mapping & 4K Cinema Skyline',
                'slug' => 'jasa-drone-aerial-mapping-skyline',
                'category' => 'drone',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'DJI Mavic 3 Pro Cine',
                    'lens' => 'Hasselblad 24mm f/2.8',
                    'focal_length' => '24mm',
                    'shutter' => '1/1250s',
                    'aperture' => 'f/4.0',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Company Profile Korporat Nusantara Industri',
                'slug' => 'company-profile-korporat-nusantara',
                'category' => 'company_profile',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony FX3 Cinema Line',
                    'lens' => 'FE 24-70mm F2.8 GM II',
                    'focal_length' => '50mm',
                    'shutter' => '1/400s',
                    'aperture' => 'f/2.8',
                    'iso' => '160',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Cinema Color Grading Master Showcase',
                'slug' => 'cinema-color-grading-master-showcase',
                'category' => 'company_profile',
                'media_type' => 'before_after',
                'file_webp_path' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
                'before_file_path' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony FX3 Cinema Line',
                    'lens' => 'FE 24-70mm F2.8 GM II',
                    'lut' => 'Langit Film Emulation Kodak 2383',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Intimate Garden Sunset Wedding & Cinematic Film',
                'slug' => 'intimate-garden-sunset-wedding',
                'category' => 'wedding',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony A7 IV',
                    'lens' => 'FE 35mm F1.4 GM',
                    'focal_length' => '35mm',
                    'shutter' => '1/1600s',
                    'aperture' => 'f/1.4',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Wisuda Outdoor Universitas Kebangsaan Nusantara',
                'slug' => 'wisuda-outdoor-universitas-kebangsaan',
                'category' => 'wisuda',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony A7R V',
                    'lens' => 'FE 85mm F1.4 GM',
                    'focal_length' => '85mm',
                    'shutter' => '1/640s',
                    'aperture' => 'f/1.8',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Tech Innovators Global Summit & Exhibition',
                'slug' => 'tech-innovators-global-summit',
                'category' => 'event',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony FX3 Cinema Line',
                    'lens' => 'FE 24-70mm F2.8 GM II',
                    'focal_length' => '35mm',
                    'shutter' => '1/320s',
                    'aperture' => 'f/2.8',
                    'iso' => '1600',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Summit Mountain Bromo Sunrise Cinematic Expedition',
                'slug' => 'summit-mountain-bromo-sunrise',
                'category' => 'traveling',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony A7 IV',
                    'lens' => 'FE 16-35mm F2.8 GM II',
                    'focal_length' => '16mm',
                    'shutter' => '1/800s',
                    'aperture' => 'f/5.6',
                    'iso' => '200',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Coastal Archipelago 4K Drone Cinema & Mapping',
                'slug' => 'coastal-archipelago-4k-drone',
                'category' => 'drone',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'DJI Mavic 3 Pro Cine',
                    'lens' => 'Hasselblad 24mm f/2.8',
                    'focal_length' => '24mm',
                    'shutter' => '1/2000s',
                    'aperture' => 'f/2.8',
                    'iso' => '100',
                ],
                'is_featured' => true,
            ],
            [
                'service_id' => $serviceMap['photography-videography'],
                'title' => 'Precision Engineering & Industrial Plant Documentary',
                'slug' => 'precision-engineering-industrial-plant',
                'category' => 'company_profile',
                'media_type' => 'photo',
                'file_webp_path' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
                'exif_metadata_json' => [
                    'camera' => 'Sony FX6 Cinema Line',
                    'lens' => 'FE 50mm F1.2 GM',
                    'focal_length' => '50mm',
                    'shutter' => '1/400s',
                    'aperture' => 'f/2.0',
                    'iso' => '320',
                ],
                'is_featured' => true,
            ],
        ];

        foreach ($galleries as $gal) {
            Gallery::updateOrCreate(['slug' => $gal['slug']], $gal);
        }

        // 4. Web Portfolios (Matching user's Web Dev categories)
        $portfolios = [
            [
                'title' => 'Sistem Operasi Internal Perusahaan & ERP',
                'slug' => 'sistem-operasi-internal-perusahaan-erp',
                'client_name' => 'PT Nusantara Mandiri Logistik',
                'project_url' => 'https://erp-internal.example.com',
                'desktop_preview_img' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
                'mobile_preview_img' => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80',
                'tech_stack_json' => ['Laravel 13', 'React.js', 'PostgreSQL', 'Tailwind v4', 'Redis'],
                'lighthouse_score' => 99,
                'challenge_text' => 'Perusahaan membutuhkan sistem sentralisasi inventaris, absensi karyawan, approval workflow, dan laporan keuangan multi-cabang.',
                'solution_text' => 'Membangun web aplikasi internal enterprise dengan akses role bertingkat, websocket notifikasi real-time, dan export PDF otomatis.',
            ],
            [
                'title' => 'Website Profile Perusahaan Korporat Modern',
                'slug' => 'website-profile-perusahaan-korporat',
                'client_name' => 'PT Samudera Global Energy',
                'project_url' => 'https://samudera-energy.example.com',
                'desktop_preview_img' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
                'mobile_preview_img' => 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
                'tech_stack_json' => ['Laravel', 'Inertia React', 'Tailwind CSS', 'Framer Motion', 'MySQL'],
                'lighthouse_score' => 98,
                'challenge_text' => 'Meningkatkan kredibilitas brand di hadapan investor global dengan web profil elegan berkecepatan tinggi.',
                'solution_text' => 'Desain bento modern, interaktif dual-theme, dukungan bilingual (ID/EN), serta integrasi CMS manajemen konten berita dan galeri.',
            ],
            [
                'title' => 'EduSmart: Portal Pendidikan, Absensi & Akademik',
                'slug' => 'edusmart-portal-pendidikan-absensi',
                'client_name' => 'Yayasan Pendidikan Al-Hikmah Nusantara',
                'project_url' => 'https://edusmart-langit.example.com',
                'desktop_preview_img' => 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80',
                'mobile_preview_img' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
                'tech_stack_json' => ['Laravel 13', 'React SPA', 'WhatsApp Gateway', 'MySQL', 'Tailwind v4'],
                'lighthouse_score' => 97,
                'challenge_text' => 'Sekolah membutuhkan sistem presensi siswa/guru berbasis QR, pengelolaan raport nilai digital, dan rekap SPP terintegrasi.',
                'solution_text' => 'Mengembangkan portal akademik terpadu dengan modul absensi scan kartu/QR, broadcast notifikasi WhatsApp ke orang tua, dan dashboard nilai guru.',
            ],
            [
                'title' => 'E-Commerce Marketplace & Sistem Booking',
                'slug' => 'ecommerce-marketplace-booking-system',
                'client_name' => 'Vortex Studio & Retail Hub',
                'project_url' => 'https://vortex-shop.example.com',
                'desktop_preview_img' => 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80',
                'mobile_preview_img' => 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=600&q=80',
                'tech_stack_json' => ['Laravel', 'React', 'Midtrans QRIS', 'RajaOngkir', 'Tailwind v4'],
                'lighthouse_score' => 96,
                'challenge_text' => 'Integrasi checkout belanja instan dengan penghitungan ongkir real-time dan pembayaran QRIS otomatis.',
                'solution_text' => 'Arsitektur one-step checkout responsif dengan verifikasi pembayaran otomatis dan integrasi WhatsApp resi pengiriman.',
            ],
        ];

        foreach ($portfolios as $p) {
            WebPortfolio::updateOrCreate(['slug' => $p['slug']], $p);
        }

        // 5. Web Estimator Components (User requirements: Operasi Internal, Profile, Pendidikan, Toko Online, Booking, dll)
        $estimatorComponents = [
            ['component_name' => 'Website Profile Perusahaan Modern (Company Profile)', 'category' => 'core', 'base_price' => 3000000, 'estimated_days' => 5],
            ['component_name' => 'Website Operasi Internal Perusahaan (ERP / HR / Inventory)', 'category' => 'core', 'base_price' => 6500000, 'estimated_days' => 12],
            ['component_name' => 'Website Pendidikan (Sistem Absensi & Portal Akademik)', 'category' => 'core', 'base_price' => 5000000, 'estimated_days' => 10],
            ['component_name' => 'Website Toko Online / E-Commerce (Katalog & Keranjang)', 'category' => 'feature', 'base_price' => 4500000, 'estimated_days' => 8],
            ['component_name' => 'Sistem Booking & Reservasi Online Jadwal Layanan', 'category' => 'feature', 'base_price' => 2500000, 'estimated_days' => 4],
            ['component_name' => 'Custom CMS & Back-Office Admin Dashboard', 'category' => 'feature', 'base_price' => 2500000, 'estimated_days' => 5],
            ['component_name' => 'Integrasi Payment Gateway Otomatis (QRIS, VA, Kartu Kredit)', 'category' => 'integration', 'base_price' => 1800000, 'estimated_days' => 3],
            ['component_name' => 'Integrasi WhatsApp Notification Gateway & CRM', 'category' => 'integration', 'base_price' => 850000, 'estimated_days' => 2],
            ['component_name' => 'SEO On-Page & Optimasi Kecepatan Google Lighthouse 95+', 'category' => 'optimization', 'base_price' => 1200000, 'estimated_days' => 3],
        ];

        foreach ($estimatorComponents as $ec) {
            WebEstimatorComponent::updateOrCreate(['component_name' => $ec['component_name']], $ec);
        }

        // 6. Education Courses (User: 1. Kursus Coding > Robotik/Web Dev/AI, 2. Kursus Office, 3. Kursus Rakit Komputer)
        $courses = [
            [
                'title' => 'Kursus Coding (Robotik, Web Dev & AI)',
                'slug' => 'kursus-coding-robotik-web-ai',
                'level' => 'intermediate',
                'duration_text' => '10 Minggu (30 Pertemuan)',
                'price' => 2500000,
                'quota' => 12,
                'mentor_name' => 'Rian Hidayat',
                'mentor_role' => 'Principal Tech Lead @ Langit',
                'syllabus_json' => [
                    ['week' => 'Minggu 1-3', 'topic' => 'Logika Pemrograman, Python/JavaScript & Dasar Robotik Arduino/ESP32'],
                    ['week' => 'Minggu 4-6', 'topic' => 'Web Development Modern: HTML5, CSS/Tailwind, React & REST API'],
                    ['week' => 'Minggu 7-8', 'topic' => 'Pengenalan Artificial Intelligence: Prompt Engineering, Python AI & OpenAI API'],
                    ['week' => 'Minggu 9-10', 'topic' => 'Proyek Akhir Terpadu: Membangun Aplikasi Web Cerdas / Robotik IoT'],
                ],
                'is_open' => true,
            ],
            [
                'title' => 'Kursus Office (Microsoft Office & Google Workspace)',
                'slug' => 'kursus-office-profesional',
                'level' => 'beginner',
                'duration_text' => '6 Minggu (18 Pertemuan)',
                'price' => 1200000,
                'quota' => 15,
                'mentor_name' => 'Siti Nurhaliza',
                'mentor_role' => 'Office Administration & Data Specialist',
                'syllabus_json' => [
                    ['week' => 'Minggu 1-2', 'topic' => 'Microsoft Word: Format Laporan Profesional, Mail Merge, Sitasi & Layout Dokumen'],
                    ['week' => 'Minggu 3-4', 'topic' => 'Microsoft Excel: Rumus VLOOKUP/XLOOKUP, IF Bertingkat, Pivot Table & Dashboard'],
                    ['week' => 'Minggu 5', 'topic' => 'Microsoft PowerPoint: Desain Slide Presentasi Modern, Infografis & Master Slide'],
                    ['week' => 'Minggu 6', 'topic' => 'Kolaborasi Cloud: Google Docs, Sheets, Drive & Integrasi Form Administrasi'],
                ],
                'is_open' => true,
            ],
            [
                'title' => 'Kursus Rakit Komputer & Hardware Lab',
                'slug' => 'kursus-rakit-komputer-hardware',
                'level' => 'beginner',
                'duration_text' => '4 Minggu (12 Pertemuan)',
                'price' => 1500000,
                'quota' => 10,
                'mentor_name' => 'Agus Prasetyo',
                'mentor_role' => 'Hardware Lab Specialist @ Langit',
                'syllabus_json' => [
                    ['week' => 'Minggu 1', 'topic' => 'Pengenalan Komponen: CPU, Motherboard, RAM, GPU, PSU, Storage & Airflow'],
                    ['week' => 'Minggu 2', 'topic' => 'Praktik Rakit PC Lengkap: Pemasangan Processor, Thermal Paste, Cooler & Cable Management'],
                    ['week' => 'Minggu 3', 'topic' => 'Instalasi OS Windows, Driver, Software Pendukung & Konfigurasi BIOS UEFI'],
                    ['week' => 'Minggu 4', 'topic' => 'Troubleshooting: Diagnosa Debug LED, Mengatasi PC No Display, dan Stress Testing'],
                ],
                'is_open' => true,
            ],
        ];

        foreach ($courses as $c) {
            EducationCourse::updateOrCreate(['slug' => $c['slug']], $c);
        }

        // 7. Computer Service Tickets (User: 1. Installasi Software, 2. Upgrade SSD, 3. Rakit PC, 4. Penggantian Part)
        $tickets = [
            [
                'receipt_number' => 'SRV-2026-0089',
                'customer_name' => 'Bambang Kusuma',
                'whatsapp' => '081234567890',
                'device_type' => 'Laptop',
                'device_brand_model' => 'ASUS ROG Zephyrus G14',
                'problem_reported' => 'Installasi Software: Windows 11 lambat, butuh install ulang clean OS + Software Desain Adobe.',
                'diagnosis_result' => 'Sistem operasi lama terkena bloatware. Dilakukan instalasi fresh Windows 11 Pro original, driver certified, dan software desain.',
                'status' => 'ready',
                'estimated_cost' => 150000,
                'final_cost' => 150000,
            ],
            [
                'receipt_number' => 'SRV-2026-0090',
                'customer_name' => 'Natasha Widjaja',
                'whatsapp' => '085712345678',
                'device_type' => 'Laptop Bisnis',
                'device_brand_model' => 'Lenovo ThinkPad X1',
                'problem_reported' => 'Upgrade SSD: Storage HDD lemot, ingin upgrade SSD NVMe 1TB kecepatan tinggi.',
                'diagnosis_result' => 'Pemasangan SSD NVMe Gen4 1TB + Kloning seluruh partisi Windows dan file kerja tanpa ada yang hilang.',
                'status' => 'repairing',
                'estimated_cost' => 850000,
                'final_cost' => null,
            ],
            [
                'receipt_number' => 'SRV-2026-0091',
                'customer_name' => 'Arif Firmansyah',
                'whatsapp' => '081398765432',
                'device_type' => 'PC Rakitan',
                'device_brand_model' => 'Custom PC Gaming & Editing Intel i7 + RTX 4070',
                'problem_reported' => 'Rakit PC: Bawa komponen lengkap, butuh jasa perakitan profesional, cable management rapi, dan instalasi software.',
                'diagnosis_result' => 'Perakitan komponen presisi, thermal paste premium PTM7950, manajemen kabel estetis, update BIOS UEFI dan stress test stabilitas 3DMark.',
                'status' => 'qc_testing',
                'estimated_cost' => 350000,
                'final_cost' => null,
            ],
            [
                'receipt_number' => 'SRV-2026-0092',
                'customer_name' => 'Dewi Safitri',
                'whatsapp' => '082155667788',
                'device_type' => 'Laptop',
                'device_brand_model' => 'Acer Swift 3',
                'problem_reported' => 'Penggantian Part: Layar LCD pecah akibat tertindih dan keyboard beberapa tombol macet.',
                'diagnosis_result' => 'Penggantian panel display LCD Full HD IPS original baru dan penggantian modul keyboard internal.',
                'status' => 'waiting_part',
                'estimated_cost' => 1250000,
                'final_cost' => null,
            ],
        ];

        foreach ($tickets as $t) {
            ComputerServiceTicket::updateOrCreate(['receipt_number' => $t['receipt_number']], $t);
        }

        // 8. Rental Equipments (User: 1. Proyektor, 2. TV, 3. Drone)
        $rentals = [
            // Kategori 1: Proyektor
            [
                'name' => 'Proyektor Epson EB-E01 3300 Lumens 3LCD',
                'slug' => 'proyektor-epson-eb-e01-3300-lumens',
                'brand' => 'Epson',
                'category' => 'proyektor',
                'price_per_day' => 150000,
                'stock_total' => 6,
                'stock_available' => 5,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Brightness' => '3300 ANSI Lumens', 'Technology' => '3LCD Technology', 'Resolusi' => 'XGA / HDMI Ready', 'Kelengkapan' => 'Kabel HDMI 10m + Power + Tas'],
                'is_active' => true,
            ],
            [
                'name' => 'Proyektor Laser ViewSonic 4K UHD 5000 Lumens',
                'slug' => 'proyektor-laser-viewsonic-4k-5000-lumens',
                'brand' => 'ViewSonic',
                'category' => 'proyektor',
                'price_per_day' => 350000,
                'stock_total' => 3,
                'stock_available' => 3,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Brightness' => '5000 ANSI Lumens', 'Resolusi' => 'True 4K UHD', 'Laser Life' => 'Up to 30.000 Hours', 'Cocok Untuk' => 'Auditorium, Ballroom & Acara Besar'],
                'is_active' => true,
            ],
            [
                'name' => 'Screen Layar Proyektor Tripod 84 Inch (178 x 178 cm)',
                'slug' => 'screen-layar-proyektor-tripod-84-inch',
                'brand' => 'D-Light',
                'category' => 'proyektor',
                'price_per_day' => 75000,
                'stock_total' => 8,
                'stock_available' => 7,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Ukuran' => '84 Inch (178x178 cm)', 'Mekanisme' => 'Tripod Portable Kokoh', 'Bahan' => 'Matte White High Contrast', 'Kemudahan' => 'Lipat Praktis & Mudah Dibawa'],
                'is_active' => true,
            ],
            // Kategori 2: TV Display
            [
                'name' => 'Smart TV 55 Inch 4K UHD + Standing Bracket',
                'slug' => 'smart-tv-55-inch-4k-standing-bracket',
                'brand' => 'Samsung / LG',
                'category' => 'tv',
                'price_per_day' => 300000,
                'stock_total' => 5,
                'stock_available' => 4,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Ukuran' => '55 Inch Crystal 4K UHD', 'Fitur' => 'Smart TV / Wireless Screen Mirroring', 'Input' => '3x HDMI, 2x USB, LAN', 'Include' => 'Floor Standing Bracket TV Beroda'],
                'is_active' => true,
            ],
            [
                'name' => 'Smart TV 65 Inch 4K HDR + Heavy Duty Standing Display',
                'slug' => 'smart-tv-65-inch-4k-hdr-heavy-duty',
                'brand' => 'Sony Bravia / LG',
                'category' => 'tv',
                'price_per_day' => 450000,
                'stock_total' => 4,
                'stock_available' => 3,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Ukuran' => '65 Inch 4K HDR Ultra-Vivid', 'Audio' => 'Dolby Atmos Audio', 'Bracket' => 'Heavy Duty Floor Stand 1.8m', 'Cocok Untuk' => 'Booth Pameran, Expo & Stage Monitor'],
                'is_active' => true,
            ],
            // Kategori 3: Drone
            [
                'name' => 'DJI Mavic 3 Pro Cine Drone Kit (Triple Camera 4K/5.1K)',
                'slug' => 'dji-mavic-3-pro-cine-kit',
                'brand' => 'DJI',
                'category' => 'drone',
                'price_per_day' => 600000,
                'stock_total' => 3,
                'stock_available' => 3,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Triple Camera' => 'Hasselblad 4/3 CMOS + 70mm + 166mm', 'Video' => 'Apple ProRes 422 HQ 5.1K', 'Waktu Terbang' => '43 Menit per Baterai', 'Kelengkapan' => 'DJI RC Pro + 3 Baterai + ND Filter'],
                'is_active' => true,
            ],
            [
                'name' => 'DJI Mini 4 Pro Fly More Combo',
                'slug' => 'dji-mini-4-pro-fly-more-combo',
                'brand' => 'DJI',
                'category' => 'drone',
                'price_per_day' => 350000,
                'stock_total' => 4,
                'stock_available' => 4,
                'thumbnail_webp' => 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
                'specs_json' => ['Berat' => '< 249g Ultralight', 'Kamera' => '4K 60fps HDR True Vertical Shooting', 'Sensor' => 'Omnidirectional Obstacle Sensing', 'Baterai' => '3x Intelligent Flight Battery'],
                'is_active' => true,
            ],
        ];

        foreach ($rentals as $r) {
            RentalEquipment::updateOrCreate(['slug' => $r['slug']], $r);
        }

        // 9. Internship Positions (4 Posisi Pilihan: Videographer, Talent/Model, Editor, Web Dev)
        InternshipPosition::query()->delete();
        $positions = [
            [
                'title' => 'Videographer',
                'slug' => 'videographer-intern',
                'division_name' => 'Photography & Videography',
                'work_type' => 'onsite',
                'quota' => 2,
                'duration_months' => 4,
                'requirements_json' => [
                    'Menguasai pengoperasian kamera mirrorless / cinema camera & stabilizer gimbal',
                    'Memahami komposisi visual, angle sinematik, camera movement, dan lighting dasar',
                    'Menyukai dokumentasi event, wedding, commercial shoot, dan traveling visual',
                    'Memiliki komitmen kerja tim dan menyertakan link portofolio karya video',
                ],
                'benefits_json' => [
                    'Akses langsung ke gear kamera sinema Sony FX3 / A7 IV dan lensa G Master',
                    'Mentoring produksi lapangan intensif bersama videografer profesional Langit',
                    'Uang transport proyek & portofolio produksi video berstandar komersial',
                ],
                'is_open' => true,
            ],
            [
                'title' => 'Talent / Model',
                'slug' => 'talent-model-intern',
                'division_name' => 'Creative & Visual',
                'work_type' => 'onsite',
                'quota' => 2,
                'duration_months' => 3,
                'requirements_json' => [
                    'Percaya diri di depan kamera untuk pemotretan foto komersial, video promosi & konten reel',
                    'Mampu berekspresi natural, luwes, komunikatif, dan memiliki artikulasi bicara yang baik',
                    'Tertarik dalam bidang fashion, brand photoshoot, commercial ads, dan lifestyle digital',
                    'Menyertakan foto komposit / foto diri terbaru atau akun media sosial publik',
                ],
                'benefits_json' => [
                    'Portofolio modeling & personal branding profesional beresolusi tinggi',
                    'Bimbingan pose, acting on-camera, dan pengalaman photoshoot nyata',
                    'Sertifikat magang resmi serta kompensasi dan fee per proyek komersial',
                ],
                'is_open' => true,
            ],
            [
                'title' => 'Editor',
                'slug' => 'editor-intern',
                'division_name' => 'Post-Production',
                'work_type' => 'hybrid',
                'quota' => 2,
                'duration_months' => 4,
                'requirements_json' => [
                    'Mahir menggunakan software editing (Adobe Premiere Pro, DaVinci Resolve, atau CapCut PC)',
                    'Memahami ritme pacing sinematik, sound design, transisi halus, dan dasar color grading (LUT/Log)',
                    'Kreatif dalam merangkai alur cerita (storytelling) video pendek maupun dokumenter panjang',
                    'Menyertakan showreel atau tautan hasil karya video yang pernah diedit',
                ],
                'benefits_json' => [
                    'Praktik color grading dengan profil Rec.709 & workflow file RAW sinema',
                    'Mentoring post-production 1-on-1 dari Senior Video Editor Langit',
                    'Uang saku bulanan, sertifikat resmi, dan portofolio editing klien nyata',
                ],
                'is_open' => true,
            ],
            [
                'title' => 'Web Dev',
                'slug' => 'web-dev-intern',
                'division_name' => 'Web Development',
                'work_type' => 'hybrid',
                'quota' => 2,
                'duration_months' => 4,
                'requirements_json' => [
                    'Memahami dasar HTML, CSS, JavaScript, serta dasar PHP/Laravel atau React.js',
                    'Tertarik mempelajari arsitektur web modern, responsive UI, dan integrasi API',
                    'Memiliki logika pemrograman yang baik, teliti, dan semangat memecahkan masalah',
                    'Nilai tambah jika memiliki repository GitHub atau proyek web yang pernah dibuat',
                ],
                'benefits_json' => [
                    'Mentoring intensif 1-on-1 dari Web Lead & keterlibatan langsung di proyek web nyata',
                    'Uang saku bulanan & sertifikat web developer kompeten',
                    'Peluang rekrutmen kerja setelah masa magang berakhir',
                ],
                'is_open' => true,
            ],
        ];

        foreach ($positions as $p) {
            InternshipPosition::updateOrCreate(['slug' => $p['slug']], $p);
        }

        // 10. Sample Consultation
        Consultation::updateOrCreate(
            ['ticket_code' => 'CNS-2026-001'],
            [
                'client_name' => 'Hendro Setiawan',
                'company_or_institution' => 'PT Megah Surya Nusantara',
                'whatsapp' => '081299887766',
                'email' => 'hendro@megahsurya.co.id',
                'service_topic' => 'Pembuatan Website & Brand System',
                'meeting_method' => 'online_meet',
                'preferred_date' => now()->addDays(2)->toDateString(),
                'preferred_time' => '14:00 - 15:00 WIB',
                'project_brief' => 'Ingin merombak seluruh website korporat kami menjadi modern dengan integrasi CMS kustom dan animasi interaktif.',
                'budget_estimation' => 'Rp 15.000.000 - Rp 30.000.000',
                'status' => 'scheduled',
            ]
        );

        // 11. Sample Collaboration
        Collaboration::updateOrCreate(
            ['email' => 'bem@kampusmerdeka.ac.id'],
            [
                'organization_name' => 'BEM Fakultas Ilmu Komputer',
                'pic_name' => 'Clara Maharani',
                'whatsapp' => '087812345678',
                'collab_type' => 'campus_visit',
                'event_date' => now()->addDays(14)->toDateString(),
                'description' => 'Mengajukan kunjungan industri dan seminar teknologi web modern bersama tim Langit untuk 60 mahasiswa.',
                'status' => 'in_discussion',
            ]
        );
    }
}
