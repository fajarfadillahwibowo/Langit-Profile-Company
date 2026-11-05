<?php

namespace App\Support;

use App\Models\ClientPhoto;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ClientPhotoThumbnail
{
    public const THUMB_DIR = 'client_photos_thumbs';
    public const MAX_DIMENSION = 720;
    public const QUALITY = 78;

    /**
     * Hasilkan thumbnail WebP terkompresi dari foto asli.
     * Mengubah foto resolusi kamera (misal 24MB 6000x4000) menjadi WebP ringan (~40-80KB).
     */
    public static function generate(ClientPhoto $photo, int $maxDimension = self::MAX_DIMENSION, int $quality = self::QUALITY): ?string
    {
        $disk = Storage::disk('public');
        $targetRelative = self::THUMB_DIR . "/{$photo->id}.webp";
        $targetFull = $disk->path($targetRelative);

        // Jika thumbnail sudah ada dan valid, langsung kembalikan
        if (file_exists($targetFull) && filesize($targetFull) > 0) {
            return $targetRelative;
        }

        $sourceFull = $disk->path($photo->file_path);
        if (!file_exists($sourceFull) || !is_readable($sourceFull)) {
            return null;
        }

        $mime = $photo->mime_type ?: (mime_content_type($sourceFull) ?: 'image/jpeg');
        if (!str_starts_with($mime, 'image/')) {
            return null;
        }

        // Pastikan direktori tujuan tersedia
        $targetDir = dirname($targetFull);
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        // Tingkatkan memory limit untuk memproses foto kamera resolusi tinggi
        @ini_set('memory_limit', '512M');

        $srcImage = null;
        try {
            // Baca image berdasarkan ekstensi/format atau string
            if ($mime === 'image/jpeg' || str_ends_with(strtolower($sourceFull), '.jpg') || str_ends_with(strtolower($sourceFull), '.jpeg')) {
                $srcImage = @imagecreatefromjpeg($sourceFull);
            } elseif ($mime === 'image/png' || str_ends_with(strtolower($sourceFull), '.png')) {
                $srcImage = @imagecreatefrompng($sourceFull);
            } elseif ($mime === 'image/webp' || str_ends_with(strtolower($sourceFull), '.webp')) {
                $srcImage = @imagecreatefromwebp($sourceFull);
            } elseif ($mime === 'image/gif' || str_ends_with(strtolower($sourceFull), '.gif')) {
                $srcImage = @imagecreatefromgif($sourceFull);
            }

            if (!$srcImage) {
                $raw = @file_get_contents($sourceFull);
                if ($raw !== false && strlen($raw) > 0) {
                    $srcImage = @imagecreatefromstring($raw);
                    unset($raw);
                }
            }

            if (!$srcImage) {
                return null;
            }

            // Normalisasi orientasi EXIF untuk foto kamera mirrorless / smartphone
            if (function_exists('exif_read_data') && ($mime === 'image/jpeg' || str_ends_with(strtolower($sourceFull), '.jpg') || str_ends_with(strtolower($sourceFull), '.jpeg'))) {
                $exif = @exif_read_data($sourceFull);
                if (!empty($exif['Orientation'])) {
                    $rotated = null;
                    switch ($exif['Orientation']) {
                        case 3:
                            $rotated = @imagerotate($srcImage, 180, 0);
                            break;
                        case 6:
                            $rotated = @imagerotate($srcImage, -90, 0);
                            break;
                        case 8:
                            $rotated = @imagerotate($srcImage, 90, 0);
                            break;
                    }
                    if ($rotated) {
                        @imagedestroy($srcImage);
                        $srcImage = $rotated;
                    }
                }
            }

            $origW = imagesx($srcImage);
            $origH = imagesy($srcImage);

            if ($origW <= 0 || $origH <= 0) {
                @imagedestroy($srcImage);
                return null;
            }

            // Hitung skala proporsional dimensi thumbnail
            if ($origW > $maxDimension || $origH > $maxDimension) {
                if ($origW >= $origH) {
                    $newW = $maxDimension;
                    $newH = (int) max(1, round(($origH / $origW) * $maxDimension));
                } else {
                    $newH = $maxDimension;
                    $newW = (int) max(1, round(($origW / $origH) * $maxDimension));
                }
            } else {
                $newW = $origW;
                $newH = $origH;
            }

            $thumbImage = @imagecreatetruecolor($newW, $newH);
            if (!$thumbImage) {
                @imagedestroy($srcImage);
                return null;
            }

            // Pertahankan transparansi bila PNG / WebP
            if ($mime === 'image/png' || $mime === 'image/webp') {
                imagealphablending($thumbImage, false);
                imagesavealpha($thumbImage, true);
            }

            imagecopyresampled($thumbImage, $srcImage, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
            @imagedestroy($srcImage);

            // Simpan sebagai WebP (atau fallback JPEG jika WebP tidak didukung GD)
            $saved = false;
            if (function_exists('imagewebp')) {
                $saved = @imagewebp($thumbImage, $targetFull, $quality);
            }

            if (!$saved) {
                // Fallback JPEG
                $targetRelative = self::THUMB_DIR . "/{$photo->id}.jpg";
                $targetFull = $disk->path($targetRelative);
                $saved = @imagejpeg($thumbImage, $targetFull, $quality);
            }

            @imagedestroy($thumbImage);

            return $saved ? $targetRelative : null;
        } catch (\Throwable $e) {
            if ($srcImage) {
                @imagedestroy($srcImage);
            }
            return null;
        }
    }

    /**
     * Dapatkan URL thumbnail foto.
     * Jika file fisik WebP sudah tersedia di disk public storage, kembalikan URL statis langsung.
     * Jika belum, arahkan ke route generator on-demand.
     */
    public static function url(ClientPhoto $photo): string
    {
        $targetRelative = self::THUMB_DIR . "/{$photo->id}.webp";
        if (Storage::disk('public')->exists($targetRelative)) {
            return Storage::disk('public')->url($targetRelative);
        }

        // Cek juga fallback jpg
        $targetJpg = self::THUMB_DIR . "/{$photo->id}.jpg";
        if (Storage::disk('public')->exists($targetJpg)) {
            return Storage::disk('public')->url($targetJpg);
        }

        return route('client.photo.preview', ['id' => $photo->id]);
    }

    /**
     * Tanggapi request pratinjau thumbnail secara aman dan cepat dengan header HTTP caching.
     */
    public static function previewResponse(ClientPhoto $photo): BinaryFileResponse|Response
    {
        $disk = Storage::disk('public');
        $targetRelative = self::THUMB_DIR . "/{$photo->id}.webp";
        $targetFull = $disk->path($targetRelative);

        if (!file_exists($targetFull) || filesize($targetFull) === 0) {
            $generated = self::generate($photo);
            if ($generated) {
                $targetFull = $disk->path($generated);
            }
        }

        if (file_exists($targetFull) && filesize($targetFull) > 0) {
            $isWebp = str_ends_with($targetFull, '.webp');
            return response()->file($targetFull, [
                'Content-Type' => $isWebp ? 'image/webp' : 'image/jpeg',
                'Cache-Control' => 'public, max-age=2592000, immutable',
            ]);
        }

        // Fallback: alirkan foto asli jika pembuatan thumbnail gagal
        $sourceFull = $disk->path($photo->file_path);
        if (file_exists($sourceFull)) {
            return response()->file($sourceFull, [
                'Content-Type' => $photo->mime_type ?: 'image/jpeg',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        abort(404, 'Foto tidak ditemukan.');
    }

    /**
     * Hapus file thumbnail saat foto dihapus dari sistem.
     */
    public static function deleteThumbnail(ClientPhoto $photo): void
    {
        $disk = Storage::disk('public');
        $disk->delete([
            self::THUMB_DIR . "/{$photo->id}.webp",
            self::THUMB_DIR . "/{$photo->id}.jpg",
        ]);
    }
}
