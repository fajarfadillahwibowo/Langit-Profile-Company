<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaOptimizationController extends Controller
{
    /**
     * Layani gambar teroptimasi WebP secara dinamis dan super ringan dengan HTTP caching.
     * Mengurangi payload gambar dari multi-megabyte menjadi ~15-60KB dengan kualitas HD.
     */
    public function optimize(Request $request)
    {
        $rawPath = (string) $request->input('p', '');
        if (empty($rawPath)) {
            abort(404, 'Path gambar tidak ditentukan.');
        }

        // 1. Bersihkan path dan cegah path traversal
        $parsed = parse_url($rawPath, PHP_URL_PATH) ?: $rawPath;
        $clean = ltrim($parsed, '/');

        if (str_contains($clean, '..') || str_contains($clean, '\\')) {
            abort(400, 'Format path tidak valid.');
        }

        // 2. Tentukan lokasi berkas fisik di server
        $sourceFile = null;
        if (str_starts_with($clean, 'storage/')) {
            $sourceFile = storage_path('app/public/' . substr($clean, 8));
        } elseif (str_starts_with($clean, 'uploads/')) {
            $sourceFile = public_path('uploads/' . substr($clean, 8));
        } elseif (str_starts_with($clean, 'images/')) {
            $sourceFile = public_path('images/' . substr($clean, 7));
        } else {
            $candidate = public_path($clean);
            if (file_exists($candidate)) {
                $sourceFile = $candidate;
            }
        }

        if (!$sourceFile || !file_exists($sourceFile) || !is_file($sourceFile) || !is_readable($sourceFile)) {
            abort(404, 'Berkas gambar tidak ditemukan di server.');
        }

        // 3. Batasi dimensi dan kualitas agar aman dan optimal
        $width = (int) $request->input('w', 1200);
        $width = max(50, min($width, 2048));

        $quality = (int) $request->input('q', 82);
        $quality = max(50, min($quality, 95));

        // 4. Siapkan direktori cache WebP di public storage
        $cacheDir = storage_path('app/public/optimized');
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }

        $sourceMtime = filemtime($sourceFile);
        $cacheFilename = md5($clean . '_' . $sourceMtime) . "_{$width}_{$quality}.webp";
        $cachePath = $cacheDir . DIRECTORY_SEPARATOR . $cacheFilename;

        // 5. Cek apakah thumbnail WebP sudah dicache dan masih valid
        if (file_exists($cachePath) && filesize($cachePath) > 0) {
            return $this->serveOptimizedFile($request, $cachePath);
        }

        // 6. Buat WebP dengan GD library jika belum ada
        @ini_set('memory_limit', '512M');
        $srcImage = null;
        $ext = strtolower(pathinfo($sourceFile, PATHINFO_EXTENSION));

        try {
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
                    unset($raw);
                }
            }

            if (!$srcImage) {
                // Fallback: alirkan file asli jika format tidak didukung GD
                return response()->file($sourceFile);
            }

            // Normalisasi orientasi EXIF untuk foto kamera
            if (function_exists('exif_read_data') && in_array($ext, ['jpg', 'jpeg'])) {
                $exif = @exif_read_data($sourceFile);
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
                return response()->file($sourceFile);
            }

            // Hitung skala dimensi
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
                return response()->file($sourceFile);
            }

            // Pertahankan transparansi alpha channel untuk PNG & WebP
            imagealphablending($targetImage, false);
            imagesavealpha($targetImage, true);

            imagecopyresampled($targetImage, $srcImage, 0, 0, 0, 0, $targetW, $targetH, $origW, $origH);

            // Simpan ke disk cache sebagai WebP
            @imagewebp($targetImage, $cachePath, $quality);

            @imagedestroy($srcImage);
            @imagedestroy($targetImage);

            if (!file_exists($cachePath) || filesize($cachePath) === 0) {
                return response()->file($sourceFile);
            }

            return $this->serveOptimizedFile($request, $cachePath);

        } catch (\Throwable $e) {
            if ($srcImage && is_resource($srcImage)) {
                @imagedestroy($srcImage);
            }
            return response()->file($sourceFile);
        }
    }

    /**
     * Sajikan file cache WebP dengan HTTP 304 ETag dan Cache-Control 30 hari.
     */
    protected function serveOptimizedFile(Request $request, string $filePath): BinaryFileResponse|\Illuminate\Http\Response
    {
        $mtime = filemtime($filePath);
        $etag = '"' . md5($filePath . '_' . $mtime) . '"';

        $clientEtag = $request->header('If-None-Match');
        if ($clientEtag && trim($clientEtag) === $etag) {
            return response('', 304)
                ->header('ETag', $etag)
                ->header('Cache-Control', 'public, max-age=2592000, immutable');
        }

        return response()->file($filePath, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=2592000, immutable',
            'ETag' => $etag,
            'Last-Modified' => gmdate('D, d M Y H:i:s', $mtime) . ' GMT',
        ]);
    }
}
