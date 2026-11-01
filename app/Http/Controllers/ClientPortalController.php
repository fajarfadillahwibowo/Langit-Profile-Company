<?php

namespace App\Http\Controllers;

use App\Models\ClientDelivery;
use App\Models\ClientPhoto;
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
            return redirect()->route('client.login');
        }

        $deliveries = ClientDelivery::where('user_id', $user->id)
            ->with(['photos' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->get();

        return Inertia::render('Client/Gallery', [
            'client' => $user,
            'deliveries' => $deliveries,
        ]);
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
