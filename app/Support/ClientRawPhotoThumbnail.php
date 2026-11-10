<?php

namespace App\Support;

use App\Models\ClientRawPhoto;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ClientRawPhotoThumbnail
{
    public const THUMB_DIR = 'client_raw_thumbs';
    public const MAX_DIMENSION = 1000;
    public const QUALITY = 82;

    /**
     * Dapatkan path font TrueType yang tersedia di sistem
     */
    protected static function getAvailableFont(): ?string
    {
        $candidateFonts = [
            'C:\\Windows\\Fonts\\arialbd.ttf',
            'C:\\Windows\\Fonts\\arial.ttf',
            'C:\\Windows\\Fonts\\segoeui.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
        ];

        foreach ($candidateFonts as $font) {
            if (file_exists($font)) {
                return $font;
            }
        }

        return null;
    }

    /**
     * Hasilkan preview WebP terkompresi dengan multiple watermark Langit Creative
     */
    public static function generate(ClientRawPhoto $photo, int $maxDimension = self::MAX_DIMENSION, int $quality = self::QUALITY): ?string
    {
        $disk = Storage::disk('public');
        $targetRelative = self::THUMB_DIR . "/{$photo->id}.webp";
        $targetFull = $disk->path($targetRelative);

        if (file_exists($targetFull) && filesize($targetFull) > 0) {
            return $targetRelative;
        }

        $sourceFull = $disk->path($photo->file_path);
        if (!file_exists($sourceFull) || !is_readable($sourceFull)) {
            return null;
        }

        $targetDir = dirname($targetFull);
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        @ini_set('memory_limit', '512M');

        $mime = $photo->mime_type ?: (mime_content_type($sourceFull) ?: 'image/jpeg');
        $srcImage = null;

        try {
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

            // Normalisasi orientasi EXIF
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

            // Skala proporsional agar gambar terkompresi tapi tetap jernih
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

            $thumb = @imagecreatetruecolor($newW, $newH);
            if (!$thumb) {
                @imagedestroy($srcImage);
                return null;
            }

            imagecopyresampled($thumb, $srcImage, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
            @imagedestroy($srcImage);

            // Terapkan watermark resmi miring diagonal l a n g i t . c r e a t i v e
            self::applyWatermark($thumb, $newW, $newH);

            $saved = false;
            if (function_exists('imagewebp')) {
                $saved = @imagewebp($thumb, $targetFull, $quality);
            }

            if (!$saved) {
                $targetRelative = self::THUMB_DIR . "/{$photo->id}.jpg";
                $targetFull = $disk->path($targetRelative);
                $saved = @imagejpeg($thumb, $targetFull, $quality);
            }

            @imagedestroy($thumb);

            return $saved ? $targetRelative : null;
        } catch (\Throwable $e) {
            if ($srcImage) {
                @imagedestroy($srcImage);
            }
            return null;
        }
    }

    /**
     * Terapkan watermark miring diagonal profesional menggunakan aset logo resmi Langit Creative
     */
    protected static function applyWatermark($image, int $w, int $h): void
    {
        $stripPath = public_path('images/watermark-strip.png');
        if (!file_exists($stripPath)) {
            $stripPath = public_path('images/watermark-langit-creative.png');
        }

        if (file_exists($stripPath) && is_readable($stripPath)) {
            $strip = @imagecreatefrompng($stripPath);
            if ($strip) {
                imagealphablending($strip, false);
                imagesavealpha($strip, true);

                $origStripW = imagesx($strip);
                $origStripH = imagesy($strip);

                // Skala strip watermark agar proporsional terhadap resolusi foto
                $scaleRatio = max(0.55, min(1.3, $w / 1100));
                $scaledW = (int) max(120, round($origStripW * $scaleRatio));
                $scaledH = (int) max(14, round($origStripH * $scaleRatio));

                $scaledStrip = imagecreatetruecolor($scaledW, $scaledH);
                imagealphablending($scaledStrip, false);
                imagesavealpha($scaledStrip, true);
                $transColor = imagecolorallocatealpha($scaledStrip, 0, 0, 0, 127);
                imagefill($scaledStrip, 0, 0, $transColor);
                imagecopyresampled($scaledStrip, $strip, 0, 0, 0, 0, $scaledW, $scaledH, $origStripW, $origStripH);
                @imagedestroy($strip);

                // Putar miring 32 derajat (diagonal profesional miring)
                $rot = @imagerotate($scaledStrip, 32, $transColor);
                @imagedestroy($scaledStrip);

                if ($rot) {
                    imagealphablending($rot, false);
                    imagesavealpha($rot, true);

                    $rw = imagesx($rot);
                    $rh = imagesy($rot);

                    imagealphablending($image, true);

                    // Kisi berulang diagonal (staggered repeating grid)
                    $stepX = (int) max(140, round($rw * 0.85));
                    $stepY = (int) max(100, round($rh * 1.3));

                    $row = 0;
                    for ($y = -$rh; $y < $h + $rh; $y += $stepY) {
                        $offsetX = ($row % 2 === 0) ? 0 : (int) round($stepX / 2);
                        for ($x = -$rw + $offsetX; $x < $w + $rw; $x += $stepX) {
                            imagecopy($image, $rot, $x, $y, 0, 0, $rw, $rh);
                        }
                        $row++;
                    }

                    @imagedestroy($rot);
                    return;
                }
            }
        }

        // Fallback jika file PNG tidak tersedia: gunakan rendering font TrueType miring
        $font = self::getAvailableFont();
        $text = 'l a n g i t . c r e a t i v e';

        $whiteAlpha = imagecolorallocatealpha($image, 255, 255, 255, 65);
        $blackAlpha = imagecolorallocatealpha($image, 15, 23, 42, 85);

        if ($font && function_exists('imagettftext')) {
            $fontSize = max(13, (int) round($w / 38));
            $angle = 32;

            $stepX = max(180, (int) round($w / 3.2));
            $stepY = max(130, (int) round($h / 3.2));

            for ($x = -100; $x < $w + 200; $x += $stepX) {
                for ($y = -50; $y < $h + 150; $y += $stepY) {
                    @imagettftext($image, $fontSize, $angle, $x + 2, $y + 2, $blackAlpha, $font, $text);
                    @imagettftext($image, $fontSize, $angle, $x, $y, $whiteAlpha, $font, $text);
                }
            }
        } else {
            for ($x = 20; $x < $w; $x += 180) {
                for ($y = 20; $y < $h; $y += 120) {
                    @imagestring($image, 5, $x + 1, $y + 1, 'l a n g i t . c r e a t i v e', $blackAlpha);
                    @imagestring($image, 5, $x, $y, 'l a n g i t . c r e a t i v e', $whiteAlpha);
                }
            }
        }
    }

    /**
     * URL pratinjau foto mentahan (dialirkan melalui route aman agar tidak bisa didownload file aslinya)
     */
    public static function url(ClientRawPhoto $photo): string
    {
        return route('client.raw-photo.preview', ['id' => $photo->id]);
    }

    /**
     * Respons pratinjau foto mentahan dengan proteksi unduhan
     */
    public static function previewResponse(ClientRawPhoto $photo): BinaryFileResponse|Response
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
                'Cache-Control' => 'private, max-age=604800',
                'Content-Disposition' => 'inline; filename="preview_langit_creative.webp"',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        // Fallback: jika pembuatan thumbnail tertunda, alirkan file asli secara aman
        $sourceFull = $disk->path($photo->file_path);
        if (file_exists($sourceFull)) {
            return response()->file($sourceFull, [
                'Content-Type' => $photo->mime_type ?: 'image/jpeg',
                'Cache-Control' => 'private, max-age=86400',
                'Content-Disposition' => 'inline; filename="preview_langit_creative.jpg"',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        abort(404, 'Pratinjau foto mentahan tidak ditemukan.');
    }

    /**
     * Hapus thumbnail jika foto dihapus
     */
    public static function deleteThumbnail(ClientRawPhoto $photo): void
    {
        $disk = Storage::disk('public');
        $disk->delete([
            self::THUMB_DIR . "/{$photo->id}.webp",
            self::THUMB_DIR . "/{$photo->id}.jpg",
        ]);
    }
}
