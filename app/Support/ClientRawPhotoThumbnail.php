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

            // BUBURKAN MULTIPLE WATERMARK LANGIT CREATIVE
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
     * Terapkan banyak watermark diagonal & tanda bukti Langit Creative ke canvas gambar
     */
    protected static function applyWatermark($image, int $w, int $h): void
    {
        $font = self::getAvailableFont();
        $text = 'LANGIT CREATIVE';
        $subtext = 'FOTO MENTAHAN • PROOF ONLY';

        // Alokasikan warna semi-transparan (alpha 0 - 127 di GD, 127 = 100% transparan)
        $whiteAlpha = imagecolorallocatealpha($image, 255, 255, 255, 65); // ~50% transparan
        $blackAlpha = imagecolorallocatealpha($image, 15, 23, 42, 85);    // shadow halus
        $cyanAlpha  = imagecolorallocatealpha($image, 6, 182, 212, 70);   // cyan brand accent

        if ($font && function_exists('imagettftext')) {
            $fontSize = max(13, (int) round($w / 38));
            $angle = 28; // Kemiringan diagonal

            $stepX = max(180, (int) round($w / 3.5));
            $stepY = max(130, (int) round($h / 3.5));

            // Grid multiple watermark berulang (diagonal repeating pattern)
            for ($x = -100; $x < $w + 200; $x += $stepX) {
                for ($y = -50; $y < $h + 150; $y += $stepY) {
                    // Shadow tipis
                    @imagettftext($image, $fontSize, $angle, $x + 2, $y + 2, $blackAlpha, $font, $text);
                    // Teks utama semi-transparan
                    @imagettftext($image, $fontSize, $angle, $x, $y, $whiteAlpha, $font, $text);
                }
            }

            // Tanda tengah besar mencolok
            $centerFontSize = max(18, (int) round($w / 22));
            $bbox = @imagettfbbox($centerFontSize, 0, $font, $text);
            if ($bbox) {
                $textW = abs($bbox[2] - $bbox[0]);
                $centerX = (int) max(10, round(($w - $textW) / 2));
                $centerY = (int) round($h / 2);

                @imagettftext($image, $centerFontSize, 0, $centerX + 2, $centerY + 2, $blackAlpha, $font, $text);
                @imagettftext($image, $centerFontSize, 0, $centerX, $centerY, $whiteAlpha, $font, $text);

                // Subtext di bawah teks tengah
                $subBbox = @imagettfbbox(max(10, (int) round($centerFontSize * 0.55)), 0, $font, $subtext);
                if ($subBbox) {
                    $subW = abs($subBbox[2] - $subBbox[0]);
                    $subX = (int) max(10, round(($w - $subW) / 2));
                    @imagettftext($image, max(10, (int) round($centerFontSize * 0.55)), 0, $subX, $centerY + 30, $cyanAlpha, $font, $subtext);
                }
            }
        } else {
            // Fallback GD built-in string tanpa file TTF eksternal
            $stepX = 180;
            $stepY = 120;
            for ($x = 20; $x < $w; $x += $stepX) {
                for ($y = 20; $y < $h; $y += $stepY) {
                    @imagestring($image, 5, $x + 1, $y + 1, 'LANGIT CREATIVE', $blackAlpha);
                    @imagestring($image, 5, $x, $y, 'LANGIT CREATIVE', $whiteAlpha);
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
