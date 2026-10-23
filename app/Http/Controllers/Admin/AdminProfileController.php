<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminProfileController extends Controller
{
    /**
     * Tampilkan Halaman Profil Admin
     */
    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Admin/Profile', [
            'admin' => $user,
        ]);
    }

    /**
     * Perbarui Informasi Data Profil & Password Admin
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:50',
            'bio' => 'nullable|string|max:1000',
            'current_password' => 'nullable|required_with:password',
            'password' => 'nullable|string|min:6|confirmed',
        ], [
            'name.required' => 'Nama lengkap administrator wajib diisi.',
            'email.required' => 'Email administrator wajib diisi.',
            'email.unique' => 'Alamat email ini sudah digunakan oleh akun lain.',
            'current_password.required_with' => 'Masukkan password saat ini untuk mengonfirmasi perubahan password.',
            'password.min' => 'Password baru minimal harus 6 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        if (! empty($validated['password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors([
                    'current_password' => 'Password saat ini yang Anda masukkan salah.',
                ]);
            }
            $user->password = Hash::make($validated['password']);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;
        $user->bio = $validated['bio'] ?? null;
        $user->save();

        return back()->with('success', 'Data profil administrator berhasil diperbarui!');
    }

    /**
     * Unggah / Ganti Foto Profil (via Unggah Berkas ATAU Kamera Langsung)
     */
    public function uploadAvatar(Request $request)
    {
        $user = $request->user();

        $destDir = public_path('uploads/avatars');
        if (! file_exists($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $avatarPath = null;

        // Opsi 1: Pengambilan Foto Kamera Langsung (Base64 WebRTC Stream)
        if ($request->filled('avatar_camera_base64')) {
            $base64Data = $request->input('avatar_camera_base64');
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, webp

                $decodedData = base64_decode($base64Data);
                if ($decodedData === false) {
                    return back()->withErrors(['avatar' => 'Gagal memproses data gambar dari kamera.']);
                }

                $filename = 'camera_'.$user->id.'_'.time().'_'.Str::random(6).'.'.$type;
                file_put_contents($destDir.'/'.$filename, $decodedData);
                $avatarPath = '/uploads/avatars/'.$filename;
            } else {
                return back()->withErrors(['avatar' => 'Format gambar kamera tidak valid.']);
            }
        }
        // Opsi 2: Unggah Berkas File (JPEG, PNG, WebP)
        elseif ($request->hasFile('avatar_file')) {
            $request->validate([
                'avatar_file' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            ], [
                'avatar_file.image' => 'Berkas harus berupa gambar.',
                'avatar_file.mimes' => 'Format foto profil harus JPG, PNG, atau WebP.',
                'avatar_file.max' => 'Ukuran berkas foto maksimal 5MB.',
            ]);

            $file = $request->file('avatar_file');
            $filename = 'upload_'.$user->id.'_'.time().'_'.Str::random(6).'.'.$file->getClientOriginalExtension();
            $file->move($destDir, $filename);
            $avatarPath = '/uploads/avatars/'.$filename;
        } else {
            return back()->withErrors(['avatar' => 'Silakan pilih berkas foto atau ambil foto menggunakan kamera.']);
        }

        // Hapus foto lama jika tersimpan di disk lokal /uploads/avatars/
        if ($user->avatar && str_starts_with($user->avatar, '/uploads/avatars/')) {
            $oldFilePath = public_path(ltrim($user->avatar, '/'));
            if (file_exists($oldFilePath)) {
                @unlink($oldFilePath);
            }
        }

        $user->avatar = $avatarPath;
        $user->save();

        return back()->with('success', 'Foto profil berhasil diperbarui!');
    }

    /**
     * Hapus Foto Profil (Revert to Default Avatar)
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/uploads/avatars/')) {
            $oldFilePath = public_path(ltrim($user->avatar, '/'));
            if (file_exists($oldFilePath)) {
                @unlink($oldFilePath);
            }
        }

        $user->avatar = null;
        $user->save();

        return back()->with('success', 'Foto profil berhasil dihapus. Profil kini menggunakan avatar inisial default.');
    }
}
