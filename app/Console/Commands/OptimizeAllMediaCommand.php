<?php

namespace App\Console\Commands;

use App\Models\Gallery;
use App\Models\Service;
use Illuminate\Console\Command;

class OptimizeAllMediaCommand extends Command
{
    protected $signature = 'media:optimize-all {--force : Buat ulang semua cache meskipun sudah ada}';
    protected $description = 'Pre-generate WebP teroptimasi untuk semua foto galeri, album, dan layanan agar loading instan';

    public function handle(): int
    {
        $this->info('Memulai pra-optimasi seluruh media visual Langit Creative...');

        $cacheDir = storage_path('app/public/optimized');
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }

        $targets = [];

        // 1. Service Images
        foreach (Service::all() as $service) {
            if ($service->image_url) {
                $targets[] = $service->image_url;
            }
        }

        // 2. Gallery Covers, Before/After & Sub Photos
        foreach (Gallery::all() as $gallery) {
            if ($gallery->file_webp_path) {
                $targets[] = $gallery->file_webp_path;
            }
            if ($gallery->before_file_path) {
                $targets[] = $gallery->before_file_path;
            }
            $subPhotos = $gallery->exif_metadata_json['sub_photos'] ?? [];
            if (is_array($subPhotos)) {
                foreach ($subPhotos as $url) {
                    if (is_string($url) && strlen($url) > 0) {
                        $targets[] = $url;
                    }
                }
            }
        }

        // 3. Static Showcase Images
        $targets[] = '/images/camera-3d-transparent.png';
        $targets[] = '/images/laptop-3d-transparent.png';

        $uniqueTargets = array_values(array_unique(array_filter($targets)));
        $this->info('Ditemukan ' . count($uniqueTargets) . ' file gambar unik untuk dioptimasi.');

        $scales = [
            ['w' => 200, 'q' => 75],
            ['w' => 360, 'q' => 75],
            ['w' => 480, 'q' => 78],
            ['w' => 1200, 'q' => 85],
            ['w' => 1400, 'q' => 85],
            ['w' => 1600, 'q' => 85],
        ];

        $totalGenerated = 0;
        $totalBytesSaved = 0;

        $bar = $this->output->createProgressBar(count($uniqueTargets));
        $bar->start();

        foreach ($uniqueTargets as $url) {
            $parsed = parse_url($url, PHP_URL_PATH) ?: $url;
            $clean = ltrim($parsed, '/');

            // Resolusi path fisik
            $sourceFile = null;
            if (str_starts_with($clean, 'storage/')) {
                $sourceFile = storage_path('app/public/' . substr($clean, 8));
            } elseif (str_starts_with($clean, 'uploads/')) {
                $sourceFile = public_path('uploads/' . substr($clean, 8));
            } elseif (str_starts_with($clean, 'images/')) {
                $sourceFile = public_path('images/' . substr($clean, 7));
            } else {
                $cand = public_path($clean);
                if (file_exists($cand)) {
                    $sourceFile = $cand;
                }
            }

            if (!$sourceFile || !file_exists($sourceFile) || !is_file($sourceFile)) {
                $bar->advance();
                continue;
            }

            $sourceSize = filesize($sourceFile);
            $sourceMtime = filemtime($sourceFile);

            foreach ($scales as $scale) {
                $w = $scale['w'];
                $q = $scale['q'];
                $cacheFilename = md5($clean . '_' . $sourceMtime) . "_{$w}_{$q}.webp";
                $cachePath = $cacheDir . DIRECTORY_SEPARATOR . $cacheFilename;

                if (!$this->option('force') && file_exists($cachePath) && filesize($cachePath) > 0) {
                    continue;
                }

                $this->generateWebP($sourceFile, $cachePath, $w, $q);
                if (file_exists($cachePath)) {
                    $totalGenerated++;
                    $saved = max(0, $sourceSize - filesize($cachePath));
                    $totalBytesSaved += $saved;
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $mbSaved = round($totalBytesSaved / 1024 / 1024, 2);
        $this->info("Sukses! {$totalGenerated} variasi WebP teroptimasi berhasil dibuat.");
        $this->info("Total bandwidth yang berhasil dihemat: ~{$mbSaved} MB.");

        return Command::SUCCESS;
    }

    protected function generateWebP(string $sourceFile, string $targetPath, int $width, int $quality): bool
    {
        @ini_set('memory_limit', '512M');
        $ext = strtolower(pathinfo($sourceFile, PATHINFO_EXTENSION));
        $srcImage = null;

        if (in_array($ext, ['jpg', 'jpeg'])) {
            $srcImage = @imagecreatefromjpeg($sourceFile);
        } elseif ($ext === 'png') {
            $srcImage = @imagecreatefrompng($sourceFile);
        } elseif ($ext === 'webp') {
            $srcImage = @imagecreatefromwebp($sourceFile);
        } elseif ($ext === 'gif') {
            $srcImage = @imagecreatefromgif($sourceFile);
        }

        if (!$srcImage) {
            $raw = @file_get_contents($sourceFile);
            if ($raw !== false && strlen($raw) > 0) {
                $srcImage = @imagecreatefromstring($raw);
            }
        }

        if (!$srcImage) {
            return false;
        }

        // Handle orientasi EXIF
        if (function_exists('exif_read_data') && in_array($ext, ['jpg', 'jpeg'])) {
            $exif = @exif_read_data($sourceFile);
            if (!empty($exif['Orientation'])) {
                $rotated = null;
                switch ($exif['Orientation']) {
                    case 3: $rotated = @imagerotate($srcImage, 180, 0); break;
                    case 6: $rotated = @imagerotate($srcImage, -90, 0); break;
                    case 8: $rotated = @imagerotate($srcImage, 90, 0); break;
                }
                if ($rotated) {
                    @imagedestroy($srcImage);
                    $srcImage = $rotated;
                }
            }
        }

        $origW = imagesx($srcImage);
        $origH = imagesy($srcImage);

        if ($origW <= $width) {
            $targetW = $origW;
            $targetH = $origH;
        } else {
            $targetW = $width;
            $targetH = (int) round($origH * ($width / $origW));
        }

        $targetImage = @imagecreatetruecolor($targetW, $targetH);
        if (!$targetImage) {
            @imagedestroy($srcImage);
            return false;
        }

        imagealphablending($targetImage, false);
        imagesavealpha($targetImage, true);

        imagecopyresampled($targetImage, $srcImage, 0, 0, 0, 0, $targetW, $targetH, $origW, $origH);
        @imagewebp($targetImage, $targetPath, $quality);

        @imagedestroy($srcImage);
        @imagedestroy($targetImage);

        return file_exists($targetPath) && filesize($targetPath) > 0;
    }
}
