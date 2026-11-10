<?php

namespace App\Http\Controllers;

use App\Models\ClientDelivery;
use App\Models\ClientPhoto;
use App\Models\ClientRawPhoto;
use App\Models\ClientRawSelection;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class ClientPortalController extends Controller
{
    /**
     * Tampilan Halaman Login Pelanggan
     */
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'client') {
                return redirect()->route('client.gallery');
            }
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Client/Login');
    }

    /**
     * Proses Login Pelanggan Menggunakan Username atau Email yang Diberikan Admin
     */
     public function login(Request $request)
     {
         $validated = $request->validate([
             'login' => 'required|string',
             'password' => 'required|string',
         ]);

         $loginInput = trim($validated['login']);
         $password = $validated['password'];

         // Cari pengguna berdasarkan username atau email
         $user = User::where('username', $loginInput)
             ->orWhere('email', $loginInput)
             ->first();

         if ($user && Hash::check($password, $user->password)) {
             Auth::login($user, $request->boolean('remember'));
             $request->session()->regenerate();

             if ($user->role === 'client') {
                 return redirect()->intended(route('client.gallery'));
             }

             return redirect()->intended(route('admin.dashboard'));
         }

         return back()->withErrors([
             'login' => 'Username atau kata sandi tidak cocok. Pastikan Anda memasukkan username dan password yang diberikan oleh admin Studio Langit.',
         ]);
     }

    /**
     * Logout Pelanggan
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('client.login');
    }

    /**
     * Halaman Utama Pengambilan Foto Pelanggan
     */
    public function gallery()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $deliveries = ClientDelivery::where('user_id', $user->id)
            ->with([
                'photos' => function ($query) {
                    $query->latest();
                },
                'rawPhotos' => function ($query) {
                    $query->latest();
                },
                'rawSelections' => function ($query) {
                    $query->latest();
                },
            ])
            ->latest()
            ->get();

        $rawSelections = ClientRawSelection::where('user_id', $user->id)
            ->with('delivery')
            ->latest()
            ->get();

        return Inertia::render('Client/Gallery', [
            'client' => $user,
            'deliveries' => $deliveries,
            'rawSelections' => $rawSelections,
        ]);
    }

    /**
     * Pratinjau Foto Mentahan Terkompresi Ber-Watermark
     * Dialirkan hanya sebagai pratinjau inline tanpa akses unduh file mentah asli.
     */
    public function previewRawPhoto($id)
    {
        $photo = ClientRawPhoto::with('delivery')->findOrFail($id);
        $user = Auth::user();

        if (!$user || ($user->id !== $photo->delivery->user_id && !in_array($user->role, ['superadmin', 'admin'], true))) {
            abort(403, 'Akses ditolak.');
        }

        return \App\Support\ClientRawPhotoThumbnail::previewResponse($photo);
    }

    /**
     * Kirim Pilihan Foto Mentahan ke Admin Studio Langit
     */
    public function submitRawSelection(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Silakan login terlebih dahulu.');
        }

        $validated = $request->validate([
            'client_delivery_id' => 'required|exists:client_deliveries,id',
            'photo_ids' => 'required|array|min:1',
            'photo_ids.*' => 'required|integer|exists:client_raw_photos,id',
            'notes' => 'nullable|string|max:1000',
        ], [
            'photo_ids.required' => 'Pilih minimal satu foto mentahan sebelum mengirim.',
            'photo_ids.min' => 'Pilih minimal satu foto mentahan sebelum mengirim.',
        ]);

        $delivery = ClientDelivery::where('id', $validated['client_delivery_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $photoIds = array_values(array_unique($validated['photo_ids']));
        $totalPhotos = count($photoIds);

        // Ambil harga dasar per foto dari album
        $pricePerPhoto = (float) ($delivery->raw_price_per_photo ?? 15000);
        $subtotal = $totalPhotos * $pricePerPhoto;

        // Hitung diskon berjenjang (diatur admin per album)
        // Jika >= 10 dapat diskon 10 foto, jika >= 5 dapat diskon 5 foto
        $discountPercent = 0.0;
        if ($totalPhotos >= 10 && ($delivery->raw_discount_10_percent ?? 0) > 0) {
            $discountPercent = (float) $delivery->raw_discount_10_percent;
        } elseif ($totalPhotos >= 5 && ($delivery->raw_discount_5_percent ?? 0) > 0) {
            $discountPercent = (float) $delivery->raw_discount_5_percent;
        }

        $discountAmount = $subtotal * ($discountPercent / 100);
        $totalPrice = max(0, $subtotal - $discountAmount);

        $selection = ClientRawSelection::create([
            'client_delivery_id' => $delivery->id,
            'user_id' => $user->id,
            'selected_photo_ids' => $photoIds,
            'total_photos' => $totalPhotos,
            'price_per_photo' => $pricePerPhoto,
            'subtotal' => $subtotal,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'total_price' => $totalPrice,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        $msg = "Pilihan {$totalPhotos} foto mentahan berhasil dikirim ke Admin Studio Langit.";
        if ($discountPercent > 0) {
            $msg .= " Anda mendapatkan diskon {$discountPercent}% (Hemat Rp " . number_format($discountAmount, 0, ',', '.') . ")!";
        }

        if (!$request->header('X-Inertia') && ($request->expectsJson() || $request->wantsJson())) {
            return response()->json([
                'success' => true,
                'message' => $msg,
                'selection' => $selection,
            ]);
        }

        return back()->with('success', $msg);
    }

    /**
     * Pratinjau Thumbnail Terkompresi (~40-80KB WebP)
     * Mengalirkan thumbnail ringan dengan HTTP caching untuk rendering galeri yang instan dan hemat kuota.
     */
    public function previewPhoto($id)
    {
        $photo = ClientPhoto::with('delivery')->findOrFail($id);
        $user = Auth::user();

        if (!$user || ($user->id !== $photo->delivery->user_id && !in_array($user->role, ['superadmin', 'admin'], true))) {
            abort(403, 'Akses ditolak.');
        }

        if ($photo->delivery->is_expired) {
            abort(403, 'Masa aktif pengunduhan foto ini telah kedaluwarsa.');
        }

        return \App\Support\ClientPhotoThumbnail::previewResponse($photo);
    }

    /**
     * Unduh File Foto Asli Penuh (Ukuran asli tanpa kompresi, misal 5MB+)
     */
    public function downloadPhoto($id)
    {
        $photo = ClientPhoto::with('delivery')->findOrFail($id);
        $user = Auth::user();

        // Verifikasi kepemilikan atau role admin
        if (!$user || ($user->id !== $photo->delivery->user_id && !in_array($user->role, ['superadmin', 'admin']))) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengunduh foto ini.');
        }

        // Cek apakah masa pengambilan foto telah kedaluwarsa
        if ($photo->delivery->is_expired) {
            abort(403, 'Masa aktif pengunduhan foto ini telah kedaluwarsa. Silakan hubungi admin Studio Langit untuk perpanjangan.');
        }

        $filePath = Storage::disk('public')->path($photo->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'File foto fisik tidak ditemukan di server.');
        }

        $photo->delivery->increment('download_count');

        return response()->download($filePath, $photo->original_name);
    }

    /**
     * Unduh Semua Foto Sekaligus dalam Format ZIP
     */
    public function downloadAllZip($deliveryId)
    {
        $delivery = ClientDelivery::with('photos')->findOrFail($deliveryId);
        $user = Auth::user();

        if (!$user || ($user->id !== $delivery->user_id && !in_array($user->role, ['superadmin', 'admin']))) {
            abort(403, 'Akses ditolak.');
        }

        if ($delivery->is_expired) {
            abort(403, 'Masa aktif pengunduhan foto ini telah kedaluwarsa.');
        }

        if ($delivery->photos->isEmpty()) {
            abort(400, 'Tidak ada foto yang tersedia untuk diunduh.');
        }

        // Buat temporary ZIP file
        $zipFileName = 'Foto_' . str_replace(' ', '_', $delivery->title) . '_' . date('Ymd_His') . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        if (!is_dir(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($delivery->photos as $idx => $photo) {
                $fullPath = Storage::disk('public')->path($photo->file_path);
                if (file_exists($fullPath)) {
                    $entryName = ($idx + 1) . '_' . $photo->original_name;
                    $zip->addFile($fullPath, $entryName);
                }
            }
            $zip->close();
        }

        $delivery->increment('download_count');

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
