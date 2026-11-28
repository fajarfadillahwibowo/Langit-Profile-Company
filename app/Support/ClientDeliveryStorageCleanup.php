<?php

namespace App\Support;

use App\Models\AiFaceScan;
use App\Models\AiPhoto;
use App\Models\AiPhotoFace;
use App\Models\AiPhotoRequest;
use App\Models\AiRequestItem;
use App\Models\ClientDelivery;
use App\Models\ClientPhoto;
use App\Models\ClientRawPhoto;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ClientDeliveryStorageCleanup
{
    /**
     * Kumpulkan semua path file & folder fisik yang terkait dengan satu album pengiriman pelanggan.
     *
     * @return array{
     *     public_files: list<string>,
     *     public_dirs: list<string>,
     *     local_files: list<string>,
     *     local_dirs: list<string>,
     *     public_web_files: list<string>,
     *     upload_ids: list<string>
     * }
     */
    public static function collectDeliveryPlan(ClientDelivery $delivery): array
    {
        $delivery->loadMissing(['photos', 'rawPhotos']);

        $publicFiles = [];
        foreach ($delivery->photos as $photo) {
            if (! empty($photo->file_path)) {
                $publicFiles[] = $photo->file_path;
            }
            $publicFiles[] = ClientPhotoThumbnail::THUMB_DIR."/{$photo->id}.webp";
            $publicFiles[] = ClientPhotoThumbnail::THUMB_DIR."/{$photo->id}.jpg";
        }

        foreach ($delivery->rawPhotos as $rawPhoto) {
            if (! empty($rawPhoto->file_path)) {
                $publicFiles[] = $rawPhoto->file_path;
            }
            $publicFiles[] = ClientRawPhotoThumbnail::THUMB_DIR."/{$rawPhoto->id}.webp";
            $publicFiles[] = ClientRawPhotoThumbnail::THUMB_DIR."/{$rawPhoto->id}.jpg";
        }

        $uploadIds = DB::table('delivery_uploads')
            ->where('client_delivery_id', $delivery->id)
            ->pluck('id')
            ->filter(fn ($id) => is_string($id) && Str::isUuid($id))
            ->values()
            ->all();

        $localDirs = array_map(
            fn (string $uuid) => "delivery_uploads/{$uuid}",
            $uploadIds
        );

        return [
            'public_files' => array_values(array_unique($publicFiles)),
            'public_dirs' => [
                "client_photos/{$delivery->id}",
                "client_raw_photos/{$delivery->id}",
            ],
            'local_files' => [],
            'local_dirs' => $localDirs,
            'public_web_files' => [],
            'upload_ids' => $uploadIds,
        ];
    }

    /**
     * Gabungkan beberapa rencana pembersihan penyimpanan menjadi satu.
     */
    public static function mergePlans(array ...$plans): array
    {
        $merged = [
            'public_files' => [],
            'public_dirs' => [],
            'local_files' => [],
            'local_dirs' => [],
            'public_web_files' => [],
            'upload_ids' => [],
        ];

        foreach ($plans as $plan) {
            foreach ($merged as $key => $_) {
                if (! empty($plan[$key])) {
                    $merged[$key] = array_merge($merged[$key], $plan[$key]);
                }
            }
        }

        foreach ($merged as $key => $items) {
            $merged[$key] = array_values(array_unique(array_filter($items, fn ($v) => is_string($v) && $v !== '')));
        }

        return $merged;
    }

    /**
     * Eksekusi penghapusan seluruh file & folder fisik di disk server (public, local, public/uploads/avatars).
     */
    public static function executePlan(array $plan): void
    {
        $publicDisk = Storage::disk('public');
        $localDisk = Storage::disk('local');

        if (! empty($plan['public_files'])) {
            $publicDisk->delete($plan['public_files']);
        }

        foreach ($plan['public_dirs'] ?? [] as $dir) {
            if (is_string($dir) && $dir !== '' && $publicDisk->exists($dir)) {
                $publicDisk->deleteDirectory($dir);
            }
        }

        if (! empty($plan['local_files'])) {
            $localDisk->delete($plan['local_files']);
        }

        foreach ($plan['local_dirs'] ?? [] as $dir) {
            if (is_string($dir) && $dir !== '' && $localDisk->exists($dir)) {
                $localDisk->deleteDirectory($dir);
            }
        }

        foreach ($plan['public_web_files'] ?? [] as $webPath) {
            if (is_string($webPath) && preg_match('~\A/uploads/avatars/[a-zA-Z0-9_.-]+\z~', $webPath)) {
                $fullPath = public_path(ltrim($webPath, '/'));
                if (is_file($fullPath) && ! is_link($fullPath)) {
                    @unlink($fullPath);
                }
            }
        }
    }

    /**
     * Hapus sesi pengiriman pelanggan secara menyeluruh:
     * - Database: delivery, foto jadi, foto mentahan, pilihan mentahan, delivery_uploads,
     *   serta akun user khusus `client` jika sudah tidak memiliki album/data lain.
     * - Disk VPS/Lokal: folder foto jadi, thumbnail foto jadi, folder foto mentahan,
     *   thumbnail watermark mentahan, sisa chunk upload, dan avatar lokal bila user ikut dihapus.
     */
    public static function deleteDelivery(ClientDelivery $delivery): void
    {
        $plan = self::collectDeliveryPlan($delivery);
        $ownerId = $delivery->user_id;

        DB::transaction(function () use ($delivery, $ownerId, &$plan) {
            if (! empty($plan['upload_ids'])) {
                DB::table('delivery_uploads')->whereIn('id', $plan['upload_ids'])->delete();
            }

            $delivery->delete();

            if ($ownerId) {
                $owner = User::find($ownerId);
                if (
                    $owner
                    && $owner->role === 'client'
                    && ! ClientDelivery::where('user_id', $owner->id)->exists()
                    && ! AiFaceScan::where('customer_id', $owner->id)->exists()
                    && ! AiPhotoRequest::where('customer_id', $owner->id)->exists()
                ) {
                    if (! empty($owner->avatar) && str_starts_with($owner->avatar, '/uploads/avatars/')) {
                        $plan['public_web_files'][] = $owner->avatar;
                    }
                    $owner->delete();
                }
            }

            DB::afterCommit(function () use ($plan) {
                self::executePlan($plan);
            });
        });
    }

    /**
     * Hapus akun pelanggan LangitLens (atau pelanggan gabungan) secara tuntas:
     * - Database: ai_face_scans, ai_photo_requests + items, client_deliveries (+ foto jadi/mentahan/seleksi),
     *   delivery_uploads terkait, serta akun users.
     * - Disk VPS/Lokal: foto scan wajah, seluruh foto jadi & mentahan album miliknya beserta thumbnail,
     *   chunk upload sementara, dan avatar lokal jika ada.
     */
    public static function deleteCustomer(User $customer): void
    {
        $plans = [];

        $scans = AiFaceScan::where('customer_id', $customer->id)->get();
        $localFiles = [];
        foreach ($scans as $scan) {
            if (! empty($scan->scan_image_path)) {
                $localFiles[] = $scan->scan_image_path;
            }
        }

        $paymentProofs = AiPhotoRequest::where('customer_id', $customer->id)
            ->whereNotNull('payment_proof_path')
            ->pluck('payment_proof_path')
            ->all();
        foreach ($paymentProofs as $proofPath) {
            if (is_string($proofPath) && $proofPath !== '') {
                $localFiles[] = $proofPath;
            }
        }

        $webFiles = [];
        if (! empty($customer->avatar) && str_starts_with($customer->avatar, '/uploads/avatars/')) {
            $webFiles[] = $customer->avatar;
        }

        $plans[] = [
            'public_files' => [],
            'public_dirs' => [],
            'local_files' => $localFiles,
            'local_dirs' => [],
            'public_web_files' => $webFiles,
            'upload_ids' => [],
        ];

        $deliveries = ClientDelivery::with(['photos', 'rawPhotos'])
            ->where('user_id', $customer->id)
            ->get();

        foreach ($deliveries as $delivery) {
            $plans[] = self::collectDeliveryPlan($delivery);
        }

        // Tangkap juga sisa delivery_uploads yang terhubung langsung ke user_id
        $userUploadIds = DB::table('delivery_uploads')
            ->where('user_id', $customer->id)
            ->pluck('id')
            ->filter(fn ($id) => is_string($id) && Str::isUuid($id))
            ->values()
            ->all();

        if (! empty($userUploadIds)) {
            $plans[] = [
                'public_files' => [],
                'public_dirs' => [],
                'local_files' => [],
                'local_dirs' => array_map(fn (string $uuid) => "delivery_uploads/{$uuid}", $userUploadIds),
                'public_web_files' => [],
                'upload_ids' => $userUploadIds,
            ];
        }

        $mergedPlan = self::mergePlans(...$plans);

        DB::transaction(function () use ($customer, $deliveries, $mergedPlan) {
            AiFaceScan::where('customer_id', $customer->id)->delete();

            $requests = AiPhotoRequest::where('customer_id', $customer->id)->get();
            foreach ($requests as $photoRequest) {
                $photoRequest->items()->delete();
                $photoRequest->delete();
            }

            if (! empty($mergedPlan['upload_ids'])) {
                DB::table('delivery_uploads')->whereIn('id', $mergedPlan['upload_ids'])->delete();
            }

            foreach ($deliveries as $delivery) {
                $delivery->delete();
            }

            $customer->delete();

            DB::afterCommit(function () use ($mergedPlan) {
                self::executePlan($mergedPlan);
            });
        });
    }

    /**
     * Sapu bersih file & folder yatim (orphan) yang tertinggal di disk server tetapi
     * datanya sudah tidak ada di database.
     *
     * @return array{
     *     client_photo_dirs: int,
     *     client_raw_dirs: int,
     *     client_photo_thumbs: int,
     *     client_raw_thumbs: int,
     *     ai_originals: int,
     *     ai_previews: int,
     *     temp_zips: int,
     *     bytes_freed: int
     * }
     */
    public static function purgeOrphanStorage(bool $dryRun = false): array
    {
        $publicDisk = Storage::disk('public');
        $localDisk = Storage::disk('local');

        $stats = [
            'client_photo_dirs' => 0,
            'client_raw_dirs' => 0,
            'client_photo_thumbs' => 0,
            'client_raw_thumbs' => 0,
            'ai_originals' => 0,
            'ai_previews' => 0,
            'temp_zips' => 0,
            'bytes_freed' => 0,
        ];

        $activeDeliveryIds = array_flip(ClientDelivery::pluck('id')->all());
        $activePhotoIds = array_flip(ClientPhoto::pluck('id')->all());
        $activeRawPhotoIds = array_flip(ClientRawPhoto::pluck('id')->all());

        // 1. Folder foto jadi yatim: storage/app/public/client_photos/{delivery_id}
        if ($publicDisk->exists('client_photos')) {
            foreach ($publicDisk->directories('client_photos') as $dir) {
                $base = basename($dir);
                if (! ctype_digit($base) || is_link($publicDisk->path($dir))) {
                    continue;
                }
                if (! isset($activeDeliveryIds[(int) $base])) {
                    $stats['client_photo_dirs']++;
                    $stats['bytes_freed'] += self::directorySizeBytes($publicDisk->path($dir));
                    if (! $dryRun) {
                        $publicDisk->deleteDirectory($dir);
                    }
                }
            }
        }

        // 2. Folder foto mentahan yatim: storage/app/public/client_raw_photos/{delivery_id}
        if ($publicDisk->exists('client_raw_photos')) {
            foreach ($publicDisk->directories('client_raw_photos') as $dir) {
                $base = basename($dir);
                if (! ctype_digit($base) || is_link($publicDisk->path($dir))) {
                    continue;
                }
                if (! isset($activeDeliveryIds[(int) $base])) {
                    $stats['client_raw_dirs']++;
                    $stats['bytes_freed'] += self::directorySizeBytes($publicDisk->path($dir));
                    if (! $dryRun) {
                        $publicDisk->deleteDirectory($dir);
                    }
                }
            }
        }

        // 3. Thumbnail foto jadi yatim: storage/app/public/client_photos_thumbs/{photo_id}.{webp|jpg}
        if ($publicDisk->exists(ClientPhotoThumbnail::THUMB_DIR)) {
            foreach ($publicDisk->files(ClientPhotoThumbnail::THUMB_DIR) as $file) {
                $base = basename($file);
                if (! preg_match('/^(\d+)\.(?:webp|jpg)$/i', $base, $match)) {
                    continue;
                }
                if (! isset($activePhotoIds[(int) $match[1]])) {
                    $stats['client_photo_thumbs']++;
                    $stats['bytes_freed'] += (int) @filesize($publicDisk->path($file));
                    if (! $dryRun) {
                        $publicDisk->delete($file);
                    }
                }
            }
        }

        // 4. Thumbnail foto mentahan yatim: storage/app/public/client_raw_thumbs/{raw_photo_id}.{webp|jpg}
        if ($publicDisk->exists(ClientRawPhotoThumbnail::THUMB_DIR)) {
            foreach ($publicDisk->files(ClientRawPhotoThumbnail::THUMB_DIR) as $file) {
                $base = basename($file);
                if (! preg_match('/^(\d+)\.(?:webp|jpg)$/i', $base, $match)) {
                    continue;
                }
                if (! isset($activeRawPhotoIds[(int) $match[1]])) {
                    $stats['client_raw_thumbs']++;
                    $stats['bytes_freed'] += (int) @filesize($publicDisk->path($file));
                    if (! $dryRun) {
                        $publicDisk->delete($file);
                    }
                }
            }
        }

        // 5. File foto LangitLens asli & preview watermark yatim
        $activeAiOriginals = array_flip(
            AiPhoto::whereNotNull('original_file_path')
                ->pluck('original_file_path')
                ->map(fn ($p) => ltrim(str_replace('\\', '/', $p), '/'))
                ->all()
        );
        $activeAiPreviews = array_flip(
            AiPhoto::whereNotNull('preview_watermarked_path')
                ->pluck('preview_watermarked_path')
                ->map(fn ($p) => ltrim(str_replace('\\', '/', $p), '/'))
                ->all()
        );

        if ($localDisk->exists('ai_originals')) {
            foreach ($localDisk->allFiles('ai_originals') as $file) {
                $norm = ltrim(str_replace('\\', '/', $file), '/');
                if (! isset($activeAiOriginals[$norm])) {
                    $stats['ai_originals']++;
                    $stats['bytes_freed'] += (int) @filesize($localDisk->path($file));
                    if (! $dryRun) {
                        $localDisk->delete($file);
                    }
                }
            }
        }

        if ($publicDisk->exists('ai_previews')) {
            foreach ($publicDisk->allFiles('ai_previews') as $file) {
                $norm = ltrim(str_replace('\\', '/', $file), '/');
                if (! isset($activeAiPreviews[$norm])) {
                    $stats['ai_previews']++;
                    $stats['bytes_freed'] += (int) @filesize($publicDisk->path($file));
                    if (! $dryRun) {
                        $publicDisk->delete($file);
                    }
                }
            }
        }

        // 6. Sisa file ZIP unduhan sementara > 6 jam di storage/app/temp
        $tempDir = storage_path('app/temp');
        if (is_dir($tempDir)) {
            $cutoff = now()->subHours(6)->timestamp;
            foreach (glob($tempDir.DIRECTORY_SEPARATOR.'*.zip') ?: [] as $zipPath) {
                if (is_file($zipPath) && ! is_link($zipPath) && @filemtime($zipPath) < $cutoff) {
                    $stats['temp_zips']++;
                    $stats['bytes_freed'] += (int) @filesize($zipPath);
                    if (! $dryRun) {
                        @unlink($zipPath);
                    }
                }
            }
        }

        return $stats;
    }

    /**
     * Hapus otomatis album pelanggan resmi yang sudah melewati masa tenggang pasca-expired.
     * Selama masih di dalam masa tenggang, album tetap hanya disembunyikan/terkunci.
     *
     * @return array{
     *     grace_days: int,
     *     deliveries_purged: int,
     *     finished_photos: int,
     *     raw_photos: int,
     *     bytes_freed: int
     * }
     */
    public static function purgeExpiredDeliveries(?int $graceDays = null, bool $dryRun = false): array
    {
        $days = max(1, (int) ($graceDays ?? config('filesystems.client_delivery_purge_grace_days', 90)));
        $cutoff = now()->subDays($days);

        $stats = [
            'grace_days' => $days,
            'deliveries_purged' => 0,
            'finished_photos' => 0,
            'raw_photos' => 0,
            'bytes_freed' => 0,
        ];

        $deliveries = ClientDelivery::with(['photos', 'rawPhotos'])
            ->whereNotNull('expired_at')
            ->where('expired_at', '<', $cutoff)
            ->orderBy('id')
            ->get();

        foreach ($deliveries as $delivery) {
            $stats['deliveries_purged']++;
            $stats['finished_photos'] += $delivery->photos->count();
            $stats['raw_photos'] += $delivery->rawPhotos->count();
            $stats['bytes_freed'] += (int) $delivery->photos->sum('file_size')
                + (int) $delivery->rawPhotos->sum('file_size');

            if (! $dryRun) {
                self::deleteDelivery($delivery);
            }
        }

        return $stats;
    }

    /**
     * Hapus tuntas SEMUA foto galeri LangitLens (untuk pergantian event & hemat penyimpanan VPS):
     * - Database: ai_photos, ai_photo_faces, ai_request_items, reset matched_photo_ids pada ai_face_scans
     *   (profil scan 3 wajah permanen pelanggan tetap aman untuk event baru), dan reset free_photo_id.
     * - Disk VPS/Lokal: seluruh file & subfolder di storage/app/private/ai_originals,
     *   storage/app/public/ai_previews, serta sisa ZIP sementara LangitLens.
     *
     * @return array{deleted_photos: int, deleted_faces: int, bytes_freed: int}
     */
    public static function purgeAllAiGalleryPhotos(): array
    {
        $publicDisk = Storage::disk('public');
        $localDisk = Storage::disk('local');

        $deletedPhotos = AiPhoto::count();
        $deletedFaces = AiPhotoFace::count();
        $recordedBytes = (int) AiPhoto::sum('original_size_bytes') + (int) AiPhoto::sum('preview_size_bytes');

        $diskBytes = 0;
        if ($localDisk->exists('ai_originals')) {
            $diskBytes += self::directorySizeBytes($localDisk->path('ai_originals'));
        }
        if ($publicDisk->exists('ai_previews')) {
            $diskBytes += self::directorySizeBytes($publicDisk->path('ai_previews'));
        }

        $originalPaths = AiPhoto::whereNotNull('original_file_path')
            ->pluck('original_file_path')
            ->filter(fn ($p) => is_string($p) && $p !== '')
            ->values()
            ->all();

        $previewPaths = AiPhoto::whereNotNull('preview_watermarked_path')
            ->pluck('preview_watermarked_path')
            ->filter(fn ($p) => is_string($p) && $p !== '')
            ->values()
            ->all();

        DB::transaction(function () use ($originalPaths, $previewPaths, $localDisk, $publicDisk) {
            User::whereNotNull('free_photo_id')->update(['free_photo_id' => null]);
            AiFaceScan::query()->update(['matched_photo_ids' => json_encode([])]);
            AiRequestItem::query()->delete();
            AiPhotoFace::query()->delete();
            AiPhoto::query()->delete();

            DB::afterCommit(function () use ($originalPaths, $previewPaths, $localDisk, $publicDisk) {
                if (! empty($originalPaths)) {
                    $localDisk->delete($originalPaths);
                }
                if ($localDisk->exists('ai_originals')) {
                    $localDisk->deleteDirectory('ai_originals');
                }

                if (! empty($previewPaths)) {
                    $publicDisk->delete($previewPaths);
                }
                if ($publicDisk->exists('ai_previews')) {
                    $publicDisk->deleteDirectory('ai_previews');
                }

                // Bersihkan juga sisa file ZIP sementara LangitLens (storage/app/private/temp_*.zip)
                foreach (glob($localDisk->path('temp_*.zip')) ?: [] as $tempZip) {
                    if (is_file($tempZip) && ! is_link($tempZip)) {
                        @unlink($tempZip);
                    }
                }
            });
        });

        return [
            'deleted_photos' => $deletedPhotos,
            'deleted_faces' => $deletedFaces,
            'bytes_freed' => max($recordedBytes, $diskBytes),
        ];
    }

    protected static function directorySizeBytes(string $path): int
    {
        if (! is_dir($path)) {
            return 0;
        }

        $total = 0;
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $total += $file->getSize();
            }
        }

        return $total;
    }
}
