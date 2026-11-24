export function cameraErrorMessage(error) {
    switch (error?.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
            return 'Izin kamera ditolak. Buka pengaturan izin situs pada browser/aplikasi, izinkan Kamera untuk situs ini, lalu muat ulang halaman dan klik Scan Kamera. Jika masih diblokir, periksa izin kamera aplikasi di pengaturan privasi Windows. Upload Foto tetap dapat digunakan.';
        case 'NotFoundError':
        case 'DevicesNotFoundError':
            return 'Kamera tidak ditemukan. Hubungkan atau aktifkan webcam, lalu klik Scan Kamera. Anda juga dapat memakai Upload Foto.';
        case 'NotReadableError':
        case 'TrackStartError':
            return 'Kamera tidak dapat diakses. Tutup aplikasi atau tab lain yang memakai kamera (misalnya Zoom/Teams), periksa izin kamera di Windows, lalu coba lagi. Upload Foto tetap tersedia.';
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
            return 'Pengaturan kamera tidak didukung perangkat ini. Coba kamera lain atau gunakan Upload Foto.';
        case 'InsecureContextError':
            return 'Kamera memerlukan HTTPS atau localhost/127.0.0.1. Buka situs melalui koneksi yang aman, atau gunakan Upload Foto.';
        case 'UnsupportedCameraError':
            return 'Browser/aplikasi ini tidak menyediakan akses kamera. Coba buka situs di Chrome/Edge terbaru atau gunakan Upload Foto.';
        case 'AbortError':
            return 'Pembukaan kamera terhenti. Silakan klik Scan Kamera lagi atau gunakan Upload Foto.';
        default:
            return 'Pratinjau kamera gagal dimulai. Muat ulang halaman lalu coba Scan Kamera, atau gunakan Upload Foto.';
    }
}

export async function requestScanCamera({
    secure = globalThis.isSecureContext,
    mediaDevices = globalThis.navigator?.mediaDevices,
    permissions = globalThis.navigator?.permissions,
} = {}) {
    if (!secure) {
        throw Object.assign(new Error('Secure connection required'), { name: 'InsecureContextError' });
    }
    if (!mediaDevices?.getUserMedia) {
        throw Object.assign(new Error('Camera API unavailable'), { name: 'UnsupportedCameraError' });
    }

    let permission;
    try {
        permission = await permissions?.query({ name: 'camera' });
    } catch {
        // Beberapa browser belum mendukung pemeriksaan izin kamera.
    }
    if (permission?.state === 'denied') {
        throw Object.assign(new Error('Camera permission denied'), { name: 'NotAllowedError' });
    }

    try {
        return await mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'user' }, width: { ideal: 960 }, height: { ideal: 720 } },
            audio: false,
        });
    } catch (error) {
        if (!['OverconstrainedError', 'ConstraintNotSatisfiedError'].includes(error?.name)) {
            throw error;
        }

        return mediaDevices.getUserMedia({ video: true, audio: false });
    }
}
