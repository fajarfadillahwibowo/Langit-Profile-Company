<?php

namespace App\Services\LangitLens;

use App\Models\AiPhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AiImageProcessingService
{
    public function processUpload(
        UploadedFile $file,
        ?string $watermarkText = null,
        ?int $watermarkOpacity = null,
        bool $prepareCleanAiFile = false
    ): array {
        @set_time_limit(300);
        @ini_set('memory_limit', '1024M');

        $subDir = date('Y/m');
        $uuid = (string) Str::uuid();
        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $originalName = $file->getClientOriginalName();
        $originalSize = (int) $file->getSize();

        // 1. Simpan file master ASLI secara utuh (resolusi penuh tanpa batas & tanpa watermark)
        $originalRelativePath = "ai_originals/{$subDir}/{$uuid}.{$ext}";
        Storage::disk('local')->putFileAs("ai_originals/{$subDir}", $file, "{$uuid}.{$ext}");
        $fullOriginalPath = Storage::disk('local')->path($originalRelativePath);

        $imageInfo = @getimagesize($fullOriginalPath);
        $originalWidth = $imageInfo[0] ?? 0;
        $originalHeight = $imageInfo[1] ?? 0;

        // 2. Buat versi pratinjau terkompresi (tetap jernih) + watermark resmi Langit
        $previewRelativePath = "ai_previews/{$subDir}/{$uuid}.webp";
        $previewFullPath = Storage::disk('public')->path($previewRelativePath);
        @mkdir(dirname($previewFullPath), 0755, true);

        $cleanAiTempPath = $prepareCleanAiFile
            ? sys_get_temp_dir().DIRECTORY_SEPARATOR."ai_clean_{$uuid}.jpg"
            : null;

        $previewSize = $this->createCompressedWatermarkedPreview(
            $fullOriginalPath,
            $previewFullPath,
            $cleanAiTempPath
        );

        return [
            'original_filename' => $originalName,
            'original_file_path' => $originalRelativePath,
            'preview_watermarked_path' => $previewRelativePath,
            'original_width' => $originalWidth,
            'original_height' => $originalHeight,
            'original_size_bytes' => $originalSize,
            'preview_size_bytes' => $previewSize,
            'clean_ai_temp_path' => ($cleanAiTempPath && is_file($cleanAiTempPath)) ? $cleanAiTempPath : null,
        ];
    }

    public function regeneratePreview(AiPhoto $photo): bool
    {
        $fullOriginalPath = Storage::disk('local')->path($photo->original_file_path);
        if (! file_exists($fullOriginalPath)) {
            return false;
        }

        $previewFullPath = Storage::disk('public')->path($photo->preview_watermarked_path);
        @mkdir(dirname($previewFullPath), 0755, true);

        $previewSize = $this->createCompressedWatermarkedPreview(
            $fullOriginalPath,
            $previewFullPath
        );

        $photo->update(['preview_size_bytes' => $previewSize]);

        return true;
    }

    public function createCompressedWatermarkedPreview(
        string $sourcePath,
        string $destPath,
        ?string $cleanAiTempPath = null
    ): int {
        @ini_set('memory_limit', '1024M');
        $info = @getimagesize($sourcePath);
        if (! $info) {
            copy($sourcePath, $destPath);

            return (int) @filesize($destPath);
        }

        $mime = $info['mime'] ?? 'image/jpeg';
        $source = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($sourcePath),
            'image/png' => @imagecreatefrompng($sourcePath),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : false,
            'image/avif' => function_exists('imagecreatefromavif') ? @imagecreatefromavif($sourcePath) : false,
            'image/bmp', 'image/x-ms-bmp' => function_exists('imagecreatefrombmp') ? @imagecreatefrombmp($sourcePath) : false,
            'image/gif' => @imagecreatefromgif($sourcePath),
            default => @imagecreatefromstring((string) file_get_contents($sourcePath)),
        };

        if (! $source) {
            copy($sourcePath, $destPath);

            return (int) @filesize($destPath);
        }

        // Perbaiki orientasi EXIF agar foto kamera/HP tidak miring
        if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
            $exif = @exif_read_data($sourcePath);
            $orientation = $exif['Orientation'] ?? 1;
            $source = match ($orientation) {
                3 => imagerotate($source, 180, 0),
                6 => imagerotate($source, -90, 0),
                8 => imagerotate($source, 90, 0),
                default => $source,
            };
        }

        $srcW = imagesx($source);
        $srcH = imagesy($source);

        // Auto-kompres resolusi ke maks 1600px (tetap tajam & jernih di mobile maupun desktop)
        $maxSide = 1600;
        if ($srcW > $maxSide || $srcH > $maxSide) {
            $ratio = min($maxSide / $srcW, $maxSide / $srcH);
            $dstW = max(1, (int) round($srcW * $ratio));
            $dstH = max(1, (int) round($srcH * $ratio));
        } else {
            $dstW = $srcW;
            $dstH = $srcH;
        }

        $canvas = imagecreatetruecolor($dstW, $dstH);
        imagealphablending($canvas, true);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH);
        imagedestroy($source);

        // Simpan salinan bersih ukuran sedang (tanpa watermark) khusus untuk dipindai InsightFace jauh lebih cepat
        if ($cleanAiTempPath !== null) {
            @imagejpeg($canvas, $cleanAiTempPath, 92);
        }

        // Terapkan Watermark Resmi Langit (Diagonal Miring 32° Staggered Grid)
        $this->applyLangitWatermark($canvas, $dstW, $dstH);

        // Simpan WebP kualitas 85 (jernih namun ukuran file hemat 75-85%)
        if (function_exists('imagewebp')) {
            imagewebp($canvas, $destPath, 85);
        } else {
            imagejpeg($canvas, $destPath, 85);
        }

        imagedestroy($canvas);

        return (int) @filesize($destPath);
    }

    /**
     * Terapkan watermark miring diagonal resmi menggunakan aset PNG Langit Creative.
     */
    private function applyLangitWatermark(\GdImage $image, int $w, int $h): void
    {
        $stripPath = public_path('images/watermark-strip.png');
        if (! file_exists($stripPath)) {
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

                // Putar miring 32 derajat (diagonal profesional miring persis Langit)
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

        // Fallback jika file PNG tidak tersedia: gunakan teks miring Langit Creative
        $font = $this->resolveFontPath();
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
                    @imagestring($image, 5, $x + 1, $y + 1, $text, $blackAlpha);
                    @imagestring($image, 5, $x, $y, $text, $whiteAlpha);
                }
            }
        }
    }

    private function resolveFontPath(): ?string
    {
        $candidates = [
            storage_path('app/fonts/watermark.ttf'),
            'C:\\Windows\\Fonts\\segoeui.ttf',
            'C:\\Windows\\Fonts\\arialbd.ttf',
            'C:\\Windows\\Fonts\\arial.ttf',
        ];

        foreach ($candidates as $path) {
            if (is_file($path)) {
                return $path;
            }
        }

        return null;
    }
}
