/**
 * Langit Creative Ecosystem - Centralized WhatsApp Template Generator
 * Menghasilkan URL WhatsApp (wa.me) dengan template pesan rapi, terstruktur,
 * dan disesuaikan per divisi serta kategori layanan di website Langit.
 */

export const DEFAULT_WHATSAPP_NUMBER = '6282246142791';

/**
 * Format string pesan WhatsApp resmi berdasarkan divisi dan kategori
 */
export function buildWhatsAppMessage(division, options = {}) {
    const {
        category = '',
        title = '',
        clientName = '',
        details = '',
        items = [],
        totalPrice = '',
        duration = '',
        ticketCode = '',
    } = options;

    switch (division) {
        case 'photo-video':
        case 'photography':
        case 'videography': {
            const cat = category || title || 'Photo & Video Cinema';
            return `Halo Admin Studio Langit, saya ingin berkonsultasi mengenai layanan Photo & Videography:

• Divisi: Photo & Video Cinema
• Kategori Layanan: ${cat}
• Rencana Tanggal/Jadwal: ${details || '...'}
• Lokasi Acara: 

Mohon informasi ketersediaan slot jadwal dan rincian paketnya. Terima kasih.`;
        }

        case 'web-dev':
        case 'website': {
            const sol = category || title || 'Pengembangan Website & Sistem Digital';
            return `Halo Tim Web Development Langit, saya ingin berkonsultasi mengenai pembuatan website & sistem:

• Divisi: Web Development & Cyber-Architecture
• Solusi/Tipe: ${sol}
• Nama Usaha/Perusahaan: ${clientName || '...'}
• Kebutuhan Fitur: ${details || '...'}

Mohon estimasi biaya pengerjaan dan alur konsultasinya. Terima kasih.`;
        }

        case 'computer-service':
        case 'servis': {
            const kendala = category || title || 'Servis & Perbaikan Komputer/Laptop';
            return `Halo Teknisi Lab Langit, saya ingin berkonsultasi mengenai kendala komputer/laptop:

• Divisi: Computer Service Lab
• Kategori Layanan: ${kendala}
• Tipe Perangkat: [Laptop / PC Rakitan / All-in-One]
• Merek & Seri: 
• Gejala Kendala: ${details || '...'}

Apakah bisa dibantu pengecekan dan estimasi perbaikannya? Terima kasih.`;
        }

        case 'sewa-alat':
        case 'rental': {
            const unit = category || title || (items.length ? items.join(', ') : 'Peralatan Kamera & Multimedia');
            return `Halo Tim Rental Langit, saya ingin menanyakan ketersediaan dan booking sewa alat:

• Divisi: Sewa Alat Produksi & Multimedia
• Unit yang Disewa: ${unit}
• Tanggal Mulai Sewa: ${details || '...'}
• Durasi Sewa: ${duration || '1 Hari'}

Mohon konfirmasi ketersediaan unit dan persyaratan jaminan sewa. Terima kasih.`;
        }

        case 'education':
        case 'kursus': {
            const program = category || title || 'Pelatihan & Kursus Komputer';
            return `Halo Admin Langit Education, saya tertarik untuk mendaftar/berkonsultasi mengenai kursus:

• Divisi: Langit Education & AI Academy
• Program Pelatihan: ${program}
• Tingkat: ${details || 'Pemula / Menengah'}
• Jalur Kelas: [Tatap Muka / Online]

Mohon info silabus materi, jadwal batch terbaru, dan biaya pendaftaran. Terima kasih.`;
        }

        case 'internship':
        case 'magang': {
            const posisi = category || title || 'Program Magang / PKL';
            return `Halo Tim HR & Internship Langit, saya ingin menanyakan informasi program magang / PKL industri:

• Divisi: Internship & Inkubasi Talenta
• Posisi yang Diminati: ${posisi}
• Nama Calon Peserta: ${clientName || '...'}
• Asal Institusi / Kampus / SMK: ${details || '...'}
• Rencana Periode Magang: 

Mohon informasi ketersediaan kuota magang pada periode tersebut. Terima kasih.`;
        }

        case 'kolaborasi':
        case 'partnership': {
            const jenis = category || title || 'Kemitraan Strategis / Event / B2B';
            return `Halo Tim Partnership & Strategic Alliance Langit, kami ingin mendiskusikan peluang kerja sama:

• Divisi: Kemitraan & Kolaborasi B2B
• Bentuk Kolaborasi: ${jenis}
• Nama Instansi / Perusahaan / Komunitas: ${clientName || '...'}
• Rencana Waktu / Jadwal: ${details || '...'}

Mohon kesediaan waktu untuk berdiskusi lebih lanjut bersama tim kami. Terima kasih.`;
        }

        case 'portfolio': {
            return `Halo Admin Studio Langit, saya melihat karya di Portofolio Studio Langit:

• Judul Karya: ${title || 'Dokumentasi Visual'}
• Kategori: ${category || 'Photo / Video'}

Saya tertarik membuat dokumentasi dengan konsep atau gaya visual serupa. Mohon informasi pricelist dan ketersediaan jadwalnya. Terima kasih.`;
        }

        case 'client-delivery': {
            return `Halo Admin Studio Langit, saya ingin konfirmasi perihal akses album foto dokumentasi:

• Nama Pelanggan: ${clientName || '...'}
• Judul Album / Sesi: ${title || 'Album Dokumentasi'}
• Kebutuhan: ${details || 'Perpanjangan Masa Unduh / Kendala Download'}

Mohon bantuan admin. Terima kasih.`;
        }

        case 'login-help': {
            return `Halo Admin Studio Langit, saya membutuhkan bantuan teknis terkait login akun di website Langit:

• Kendala: ${details || 'Lupa kata sandi / Belum mendapatkan username'}
• Nama: ${clientName || '...'}

Mohon panduan untuk mengakses akun saya. Terima kasih.`;
        }

        case 'general':
        default: {
            return `Halo Studio Langit, saya ingin berkonsultasi mengenai layanan dan proyek Studio Langit:

• Nama: ${clientName || '...'}
• Layanan yang Diminati: ${category || 'Layanan Studio Langit'}
• Catatan / Pertanyaan: ${details || '...'}

Mohon informasi lebih lanjut. Terima kasih.`;
        }
    }
}

/**
 * Menghasilkan URL lengkap WhatsApp https://wa.me/... dengan nomor dan teks yang telah di-encode
 */
export function getWhatsAppUrl(division = 'general', options = {}) {
    const rawPhone = options.phone || DEFAULT_WHATSAPP_NUMBER;
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '') || DEFAULT_WHATSAPP_NUMBER;
    
    // Jika customMessage diberikan secara langsung, gunakan itu
    const message = options.customMessage || buildWhatsAppMessage(division, options);
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export default getWhatsAppUrl;
