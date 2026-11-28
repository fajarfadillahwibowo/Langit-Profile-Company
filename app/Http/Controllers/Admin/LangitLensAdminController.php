<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiDiscountRule;
use App\Models\AiFaceScan;
use App\Models\AiPhoto;
use App\Models\AiPhotoFace;
use App\Models\AiPhotoRequest;
use App\Models\User;
use App\Services\LangitLens\AiImageProcessingService;
use App\Services\LangitLens\InsightFaceClient;
use App\Support\ClientDeliveryStorageCleanup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LangitLensAdminController extends Controller
{
    public function dashboard(): Response
    {
        $totalPhotos = AiPhoto::count();
        $totalIndexedFaces = AiPhotoFace::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $pendingRequests = AiPhotoRequest::where('status', 'WAITING_MANUAL_PAYMENT')->count();
        $completedRequests = AiPhotoRequest::where('status', 'SENT_BY_ADMIN')->count();
        $totalRevenue = (float) AiPhotoRequest::where('status', 'SENT_BY_ADMIN')->sum('total_final_price');
        $rule = AiDiscountRule::current();

        $recentRequests = AiPhotoRequest::with('customer:id,name,username,whatsapp_number')
            ->latest('requested_at')
            ->limit(6)
            ->get()
            ->map(fn (AiPhotoRequest $req) => [
                'id' => $req->id,
                'request_code' => $req->request_code,
                'customer_name' => $req->customer?->name ?? $req->customer?->username ?? 'Pelanggan',
                'total_selected_photos' => $req->total_selected_photos,
                'total_final_price' => $req->total_final_price,
                'status' => $req->status,
                'requested_at' => $req->requested_at?->format('d M Y H:i'),
            ]);

        $totalCompressedBytes = (int) AiPhoto::sum('original_size_bytes');
        $totalSourceBytes = (int) (AiPhoto::selectRaw('COALESCE(SUM(COALESCE(source_size_bytes, original_size_bytes)), 0) as total')->value('total') ?? 0);

        return Inertia::render('Admin/LangitLens/Dashboard', [
            'stats' => [
                'totalPhotos' => $totalPhotos,
                'totalOriginalBytes' => $totalCompressedBytes,
                'totalCompressedBytes' => $totalCompressedBytes,
                'totalSourceBytes' => $totalSourceBytes,
                'totalPreviewBytes' => (int) AiPhoto::sum('preview_size_bytes'),
                'totalIndexedFaces' => $totalIndexedFaces,
                'totalCustomers' => $totalCustomers,
                'pendingRequests' => $pendingRequests,
                'completedRequests' => $completedRequests,
                'totalRevenue' => $totalRevenue,
            ],
            'discountRule' => $rule,
            'recentRequests' => $recentRequests,
        ])->with('adminPortal', app(AdminDashboardController::class)->portalProps());
    }

    public function photos(InsightFaceClient $insightFace): Response
    {
        $rule = AiDiscountRule::current();

        $photos = AiPhoto::withCount('faces')
            ->latest()
            ->paginate(24)
            ->through(fn (AiPhoto $photo) => [
                'id' => $photo->id,
                'title' => $photo->title ?: $photo->original_filename,
                'original_filename' => $photo->original_filename,
                'preview_url' => Storage::disk('public')->url($photo->preview_watermarked_path),
                'original_width' => $photo->original_width,
                'original_height' => $photo->original_height,
                'original_size_bytes' => $photo->original_size_bytes,
                'preview_size_bytes' => $photo->preview_size_bytes,
                'price' => $photo->price,
                'face_count' => $photo->faces_count,
                'created_at' => $photo->created_at?->format('d M Y H:i'),
            ]);

        $maxMb = max(0.3, min(2.0, (float) ($rule->compress_max_mb ?? 2.0)));
        $maxBytes = (int) round($maxMb * 1024 * 1024);
        $oversizedPhotosCount = AiPhoto::where('original_size_bytes', '>', $maxBytes)->count();

        return Inertia::render('Admin/LangitLens/Photos', [
            'photos' => $photos,
            'defaultPrice' => $rule->default_photo_price,
            'discountRule' => $rule,
            'oversizedPhotosCount' => $oversizedPhotosCount,
            'insightFaceReady' => $insightFace->isHealthy(),
        ])->with('adminPortal', app(AdminDashboardController::class)->portalProps());
    }

    public function storePhoto(
        Request $request,
        AiImageProcessingService $imageService,
        InsightFaceClient $insightFace
    ): JsonResponse {
        @set_time_limit(300);
        @ini_set('memory_limit', '1024M');

        $allowedPhotoExts = [
            'jpg', 'jpeg', 'jpe', 'jfif', 'pjpeg', 'pjp', 'png', 'apng', 'webp', 'gif',
            'bmp', 'dib', 'avif', 'avifs', 'heic', 'heif', 'hif', 'svg', 'svgz', 'ico',
            'cur', 'tif', 'tiff', 'tga', 'icb', 'vda', 'vst', 'jxl', 'jp2', 'j2k', 'jpf',
            'jpx', 'jpm', 'mj2', 'raw', 'dng', 'cr2', 'cr3', 'crw', 'nef', 'nrw', 'arw',
            'srf', 'sr2', 'orf', 'rw2', 'raf', 'pef', 'srw', 'x3f', 'erf', 'mrw', 'dcr',
            'kdc', 'mos', 'psd', 'xcf', 'exr', 'hdr', 'wbmp', 'xbm', 'xpm',
        ];

        $request->validate([
            'photo' => [
                'required',
                'file',
                function (string $attribute, mixed $value, \Closure $fail) use ($allowedPhotoExts): void {
                    $mime = strtolower((string) $value->getMimeType());
                    $clientMime = strtolower((string) $value->getClientMimeType());
                    $ext = strtolower((string) $value->getClientOriginalExtension());

                    $isImageMime = str_starts_with($mime, 'image/') || str_starts_with($clientMime, 'image/');
                    $isImageExt = in_array($ext, $allowedPhotoExts, true);

                    if (! $isImageMime && ! $isImageExt) {
                        $fail('File yang diunggah harus berupa file foto/gambar.');
                    }
                },
            ],
            'price' => ['nullable', 'numeric', 'min:0'],
            'title' => ['nullable', 'string', 'max:255'],
            'faces' => ['nullable', 'string'],
            'original_filename' => ['nullable', 'string', 'max:255'],
            'source_size_bytes' => ['nullable', 'integer', 'min:0'],
            'source_hash' => ['nullable', 'string', 'max:64'],
        ]);

        $file = $request->file('photo');
        $rule = AiDiscountRule::current();
        $price = $request->filled('price') ? (float) $request->input('price') : $rule->default_photo_price;

        $originalName = trim((string) ($request->input('original_filename') ?: $file->getClientOriginalName()));
        $fileHash = trim((string) ($request->input('source_hash') ?: hash_file('sha256', $file->getRealPath())));

        // Aturan Anti-Duplikat: tolak jika nama file atau isi foto sudah ada di galeri
        $isDuplicateName = $originalName !== ''
            && AiPhoto::whereRaw('LOWER(original_filename) = ?', [strtolower($originalName)])->exists();
        $isDuplicateHash = $fileHash !== ''
            && AiPhoto::where('file_hash', $fileHash)->exists();

        if ($isDuplicateName || $isDuplicateHash) {
            return response()->json([
                'duplicate' => true,
                'message' => "Foto \"{$originalName}\" sudah ada di galeri (duplikat ditolak agar hemat penyimpanan VPS).",
            ], 409);
        }

        // Kompresi galeri selalu wajib aktif (maks 2 MB) agar penyimpanan VPS tidak membengkak
        $compressEnabled = true;
        $maxMb = max(0.3, min(2.0, (float) ($rule->compress_max_mb ?? 2.0)));
        $maxBytes = (int) round($maxMb * 1024 * 1024);
        $maxDimension = max(1000, min(4000, (int) ($rule->compress_max_dimension ?? 2400)));
        $quality = max(65, min(95, (int) ($rule->compress_quality ?? 88)));
        $sourceSizeBytes = $request->filled('source_size_bytes') ? (int) $request->input('source_size_bytes') : null;

        $processed = $imageService->processUpload(
            $file,
            null,
            null,
            true,
            $originalName,
            $compressEnabled,
            $maxBytes,
            $maxDimension,
            $quality,
            $sourceSizeBytes
        );
        $cleanAiTempPath = $processed['clean_ai_temp_path'] ?? null;

        $facesData = [];
        $usedEngine = 'client-fallback';
        $fullOriginalPath = Storage::disk('local')->path($processed['original_file_path']);
        $aiInputPath = $cleanAiTempPath ?: $fullOriginalPath;

        try {
            $aiResult = $insightFace->detectFromPath($aiInputPath, false, false, false);
            $facesData = $aiResult['faces'] ?? [];
            $usedEngine = $aiResult['engine'] ?? 'insightface-arcface-512d';
        } catch (\Throwable) {
            // Fallback ke ekstraksi browser jika InsightFace tidak merespons
        } finally {
            if ($cleanAiTempPath && is_file($cleanAiTempPath)) {
                @unlink($cleanAiTempPath);
            }
        }

        if (empty($facesData) && $request->filled('faces')) {
            $decoded = json_decode((string) $request->input('faces'), true);
            if (is_array($decoded)) {
                $facesData = $decoded;
                $usedEngine = 'client-fallback';
            }
        }

        $photo = DB::transaction(function () use ($request, $processed, $price, $facesData, $fileHash) {
            $photo = AiPhoto::create([
                'uploaded_by_admin_id' => $request->user()->id,
                'title' => $request->input('title') ?: pathinfo($processed['original_filename'], PATHINFO_FILENAME),
                'original_filename' => $processed['original_filename'],
                'file_hash' => $fileHash ?: null,
                'original_file_path' => $processed['original_file_path'],
                'preview_watermarked_path' => $processed['preview_watermarked_path'],
                'original_width' => $processed['original_width'],
                'original_height' => $processed['original_height'],
                'original_size_bytes' => $processed['original_size_bytes'],
                'source_size_bytes' => $processed['source_size_bytes'],
                'preview_size_bytes' => $processed['preview_size_bytes'],
                'price' => $price,
                'is_active' => true,
            ]);

            foreach ($facesData as $face) {
                if (! isset($face['face_embedding']) || ! is_array($face['face_embedding'])) {
                    continue;
                }
                AiPhotoFace::create([
                    'photo_id' => $photo->id,
                    'face_embedding' => $face['face_embedding'],
                    'bounding_box' => $face['bounding_box'] ?? null,
                    'confidence_score' => (float) ($face['confidence_score'] ?? 0.95),
                ]);
            }

            return $photo;
        });

        $photo->loadCount('faces');

        return response()->json([
            'success' => true,
            'engine' => $usedEngine,
            'photo' => [
                'id' => $photo->id,
                'title' => $photo->title,
                'original_filename' => $photo->original_filename,
                'preview_url' => Storage::disk('public')->url($photo->preview_watermarked_path),
                'original_width' => $photo->original_width,
                'original_height' => $photo->original_height,
                'original_size_bytes' => $photo->original_size_bytes,
                'preview_size_bytes' => $photo->preview_size_bytes,
                'price' => $photo->price,
                'face_count' => $photo->faces_count,
                'created_at' => $photo->created_at?->format('d M Y H:i'),
            ],
        ]);
    }

    public function updatePrice(Request $request, AiPhoto $photo): RedirectResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $photo->update($validated);

        return back()->with('success', 'Harga/judul foto berhasil diperbarui.');
    }

    public function cleanSource(AiPhoto $photo): BinaryFileResponse
    {
        $path = Storage::disk('local')->path($photo->original_file_path);
        abort_unless(file_exists($path), 404);

        return response()->file($path);
    }

    public function reindexFaces(Request $request, AiPhoto $photo, InsightFaceClient $insightFace): JsonResponse
    {
        @set_time_limit(180);

        $facesData = [];
        $usedEngine = 'client-fallback';
        $fullOriginalPath = Storage::disk('local')->path($photo->original_file_path);

        try {
            if (file_exists($fullOriginalPath)) {
                $aiResult = $insightFace->detectFromPath($fullOriginalPath, false, false, false);
                $facesData = $aiResult['faces'] ?? [];
                $usedEngine = $aiResult['engine'] ?? 'insightface-arcface-512d';
            }
        } catch (\Throwable) {
            $validated = $request->validate([
                'faces' => ['required', 'array'],
            ]);
            $facesData = $validated['faces'];
        }

        DB::transaction(function () use ($photo, $facesData) {
            $photo->faces()->delete();

            foreach ($facesData as $face) {
                if (! isset($face['face_embedding']) || ! is_array($face['face_embedding'])) {
                    continue;
                }
                AiPhotoFace::create([
                    'photo_id' => $photo->id,
                    'face_embedding' => $face['face_embedding'],
                    'bounding_box' => $face['bounding_box'] ?? null,
                    'confidence_score' => (float) ($face['confidence_score'] ?? 0.95),
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'engine' => $usedEngine,
            'face_count' => $photo->faces()->count(),
        ]);
    }

    public function reindexAllInsightFace(Request $request, InsightFaceClient $insightFace): JsonResponse|RedirectResponse
    {
        @set_time_limit(600);
        @ini_set('memory_limit', '1024M');

        $wantsJson = $request->expectsJson() && ! $request->header('X-Inertia');

        if (! $insightFace->isHealthy()) {
            if ($wantsJson) {
                return response()->json([
                    'success' => false,
                    'message' => 'InsightFace server belum aktif di port 8001.',
                ], 503);
            }

            return back()->with('error', 'Mesin Deteksi Wajah (InsightFace) belum aktif di port 8001.');
        }

        $processed = 0;
        $totalFaces = 0;

        foreach (AiPhoto::all() as $photo) {
            $fullPath = Storage::disk('local')->path($photo->original_file_path);
            if (! file_exists($fullPath)) {
                continue;
            }

            try {
                $aiResult = $insightFace->detectFromPath($fullPath, false, false, false);
                $facesData = $aiResult['faces'] ?? [];

                DB::transaction(function () use ($photo, $facesData) {
                    $photo->faces()->delete();
                    foreach ($facesData as $face) {
                        if (! isset($face['face_embedding']) || ! is_array($face['face_embedding'])) {
                            continue;
                        }
                        AiPhotoFace::create([
                            'photo_id' => $photo->id,
                            'face_embedding' => $face['face_embedding'],
                            'bounding_box' => $face['bounding_box'] ?? null,
                            'confidence_score' => (float) ($face['confidence_score'] ?? 0.95),
                        ]);
                    }
                });

                $processed++;
                $totalFaces += count($facesData);
            } catch (\Throwable) {
                continue;
            }
        }

        if ($wantsJson) {
            return response()->json([
                'success' => true,
                'processed_photos' => $processed,
                'total_faces' => $totalFaces,
            ]);
        }

        return back()->with('success', "Berhasil memindai ulang {$processed} foto ({$totalFaces} wajah terdeteksi dengan InsightFace).");
    }

    public function destroyPhoto(AiPhoto $photo): RedirectResponse
    {
        $originalPath = $photo->original_file_path;
        $previewPath = $photo->preview_watermarked_path;

        DB::transaction(function () use ($photo, $originalPath, $previewPath) {
            $photo->delete();

            DB::afterCommit(function () use ($originalPath, $previewPath) {
                if (! empty($originalPath)) {
                    Storage::disk('local')->delete($originalPath);
                }
                if (! empty($previewPath)) {
                    Storage::disk('public')->delete($previewPath);
                }
            });
        });

        return back()->with('success', 'Foto berhasil dihapus tuntas dari database dan penyimpanan server.');
    }

    public function destroyAllPhotos(): RedirectResponse
    {
        @set_time_limit(300);

        $result = ClientDeliveryStorageCleanup::purgeAllAiGalleryPhotos();

        if ($result['deleted_photos'] === 0 && $result['bytes_freed'] === 0) {
            return back()->with('success', 'Galeri foto LangitLens sudah kosong.');
        }

        $bytes = $result['bytes_freed'];
        $freedLabel = $bytes >= 1073741824
            ? number_format($bytes / 1073741824, 2).' GB'
            : ($bytes >= 1048576
                ? number_format($bytes / 1048576, 2).' MB'
                : number_format($bytes / 1024, 0).' KB');

        return back()->with(
            'success',
            "Semua {$result['deleted_photos']} foto galeri & seluruh file fisik di disk server ({$freedLabel}) berhasil dihapus tuntas. Galeri siap untuk event baru."
        );
    }

    public function updateCompressionRules(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'compress_uploads_enabled' => ['nullable', 'boolean'],
            'compress_max_mb' => ['required', 'numeric', 'min:0.3', 'max:2'],
            'compress_max_dimension' => ['required', 'integer', 'min:1000', 'max:4000'],
            'compress_quality' => ['required', 'integer', 'min:65', 'max:95'],
        ], [
            'compress_max_mb.max' => 'Batas kompresi galeri maksimal 2 MB agar penyimpanan VPS tetap hemat.',
            'compress_max_mb.min' => 'Batas kompresi minimal 0.3 MB agar foto tetap jernih.',
        ]);

        $rule = AiDiscountRule::current();
        $rule->update([
            'compress_uploads_enabled' => true,
            'compress_max_mb' => $validated['compress_max_mb'],
            'compress_max_dimension' => $validated['compress_max_dimension'],
            'compress_quality' => $validated['compress_quality'],
        ]);

        return back()->with('success', 'Aturan kompresi wajib aktif (maks '.number_format((float) $validated['compress_max_mb'], 1).' MB) berhasil disimpan.');
    }

    public function compressExistingPhotos(AiImageProcessingService $imageService): RedirectResponse
    {
        @set_time_limit(600);
        @ini_set('memory_limit', '1024M');

        $rule = AiDiscountRule::current();
        $maxMb = max(0.3, min(2.0, (float) ($rule->compress_max_mb ?? 2.0)));
        $maxBytes = (int) round($maxMb * 1024 * 1024);
        $maxDimension = max(1000, min(4000, (int) ($rule->compress_max_dimension ?? 2400)));
        $quality = max(65, min(95, (int) ($rule->compress_quality ?? 88)));

        $photos = AiPhoto::where('original_size_bytes', '>', $maxBytes)->get();
        if ($photos->isEmpty()) {
            return back()->with('success', 'Semua foto di galeri sudah terkompres di bawah '.number_format($maxMb, 1).' MB.');
        }

        $compressedCount = 0;
        $savedBytes = 0;

        foreach ($photos as $photo) {
            $oldRelPath = $photo->original_file_path;
            $oldFullPath = Storage::disk('local')->path($oldRelPath);
            if (! is_file($oldFullPath)) {
                continue;
            }

            $beforeBytes = (int) (@filesize($oldFullPath) ?: $photo->original_size_bytes);
            $dir = dirname($oldRelPath);
            $stem = pathinfo($oldRelPath, PATHINFO_FILENAME);
            $newRelPath = ($dir !== '.' ? $dir.'/' : '').$stem.'.jpg';
            $newFullPath = Storage::disk('local')->path($newRelPath);

            if ($imageService->compressImageToByteLimit($oldFullPath, $newFullPath, $maxBytes, $maxDimension, $quality)) {
                if ($newFullPath !== $oldFullPath && is_file($oldFullPath)) {
                    @unlink($oldFullPath);
                }

                clearstatcache(true, $newFullPath);
                $afterBytes = (int) (@filesize($newFullPath) ?: $beforeBytes);
                $info = @getimagesize($newFullPath);

                $photo->update([
                    'original_file_path' => $newRelPath,
                    'original_size_bytes' => $afterBytes,
                    'source_size_bytes' => max((int) ($photo->source_size_bytes ?? 0), $beforeBytes),
                    'original_width' => $info[0] ?? $photo->original_width,
                    'original_height' => $info[1] ?? $photo->original_height,
                ]);

                $compressedCount++;
                $savedBytes += max(0, $beforeBytes - $afterBytes);
            }
        }

        $savedMb = number_format($savedBytes / (1024 * 1024), 1);

        return back()->with('success', "Berhasil mengompres {$compressedCount} foto lama menjadi <= ".number_format($maxMb, 1)." MB (hemat {$savedMb} MB penyimpanan VPS).");
    }

    public function updateDiscount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:150'],
            'min_photos_selected' => ['required', 'integer', 'min:1', 'max:100'],
            'discount_percentage' => ['required', 'numeric', 'min:0', 'max:95'],
            'default_photo_price' => ['required', 'numeric', 'min:0'],
            'admin_whatsapp' => ['required', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:80'],
            'bank_account_holder' => ['nullable', 'string', 'max:150'],
            'manual_payment_info' => ['nullable', 'string', 'max:2000'],
            'qris_image' => ['nullable', 'image', 'max:5120'],
            'remove_qris' => ['nullable', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ], [
            'qris_image.image' => 'File QRIS harus berupa gambar.',
            'qris_image.max' => 'Ukuran gambar QRIS maksimal 5 MB.',
        ]);

        $rule = AiDiscountRule::current();

        $updates = [
            'name' => ! empty($validated['name']) ? $validated['name'] : ($rule->name ?: 'Diskon Paket Foto'),
            'min_photos_selected' => $validated['min_photos_selected'],
            'discount_percentage' => $validated['discount_percentage'],
            'default_photo_price' => $validated['default_photo_price'],
            'admin_whatsapp' => $validated['admin_whatsapp'],
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'bank_account_holder' => $validated['bank_account_holder'] ?? null,
            'manual_payment_info' => $validated['manual_payment_info'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        $oldQrisPath = $rule->qris_image_path;

        if ($request->boolean('remove_qris')) {
            $updates['qris_image_path'] = null;
            if (! empty($oldQrisPath)) {
                Storage::disk('public')->delete($oldQrisPath);
            }
        } elseif ($request->hasFile('qris_image')) {
            $file = $request->file('qris_image');
            $ext = strtolower($file->getClientOriginalExtension() ?: 'png');
            $newPath = Storage::disk('public')->putFileAs(
                'langitlens_payment',
                $file,
                'qris_'.time().'_'.\Illuminate\Support\Str::random(6).'.'.$ext
            );
            $updates['qris_image_path'] = $newPath;
            if (! empty($oldQrisPath) && $oldQrisPath !== $newPath) {
                Storage::disk('public')->delete($oldQrisPath);
            }
        }

        $rule->update($updates);

        return back()->with('success', 'Pengaturan diskon, QRIS, dan rekening bank berhasil disimpan.');
    }

    public function requests(Request $request): Response
    {
        $statusFilter = $request->query('status', 'ALL');

        $query = AiPhotoRequest::with([
            'customer:id,name,username,email,whatsapp_number,phone',
            'items.photo',
        ])->latest('requested_at');

        if (in_array($statusFilter, ['WAITING_MANUAL_PAYMENT', 'SENT_BY_ADMIN', 'CANCELLED'], true)) {
            $query->where('status', $statusFilter);
        }

        $requests = $query->get()->map(function (AiPhotoRequest $req) {
            return [
                'id' => $req->id,
                'request_code' => $req->request_code,
                'status' => $req->status,
                'payment_method' => $req->payment_method,
                'payment_proof_url' => $req->payment_proof_path
                    ? route('admin.langitlens.requests.payment-proof', ['photoRequest' => $req->id])
                    : null,
                'payment_proof_download_url' => $req->payment_proof_path
                    ? route('admin.langitlens.requests.payment-proof', ['photoRequest' => $req->id, 'download' => 1])
                    : null,
                'payment_proof_name' => $req->payment_proof_original_name,
                'payment_proof_uploaded_at' => $req->payment_proof_uploaded_at?->format('d M Y H:i'),
                'payment_confirmed_at' => $req->payment_confirmed_at?->format('d M Y H:i'),
                'total_selected_photos' => $req->total_selected_photos,
                'subtotal_price' => $req->subtotal_price,
                'discount_percentage_applied' => $req->discount_percentage_applied,
                'discount_amount' => $req->discount_amount,
                'total_final_price' => $req->total_final_price,
                'customer_notes' => $req->customer_notes,
                'admin_notes' => $req->admin_notes,
                'requested_at' => $req->requested_at?->format('d M Y H:i'),
                'sent_at' => $req->sent_at?->format('d M Y H:i'),
                'customer' => $req->customer,
                'items' => $req->items->map(fn ($item) => [
                    'id' => $item->id,
                    'photo_id' => $item->photo_id,
                    'price_at_request' => $item->price_at_request,
                    'is_original_unlocked' => $item->is_original_unlocked,
                    'title' => $item->photo?->title ?? 'Foto Terhapus',
                    'original_filename' => $item->photo?->original_filename ?? '-',
                    'original_width' => $item->photo?->original_width ?? 0,
                    'original_height' => $item->photo?->original_height ?? 0,
                    'original_size_bytes' => $item->photo?->original_size_bytes ?? 0,
                    'preview_url' => $item->photo
                        ? Storage::disk('public')->url($item->photo->preview_watermarked_path)
                        : null,
                ]),
            ];
        });

        return Inertia::render('Admin/LangitLens/Requests', [
            'requests' => $requests,
            'statusFilter' => $statusFilter,
            'discountRule' => AiDiscountRule::current(),
        ])->with('adminPortal', app(AdminDashboardController::class)->portalProps());
    }

    public function paymentProof(Request $request, AiPhotoRequest $photoRequest): BinaryFileResponse
    {
        $path = $photoRequest->payment_proof_path;
        if (empty($path) || ! Storage::disk('local')->exists($path)) {
            abort(404, 'Bukti pembayaran tidak ditemukan.');
        }

        $fullPath = Storage::disk('local')->path($path);
        $downloadName = $photoRequest->payment_proof_original_name ?: basename($fullPath);

        if ($request->boolean('download')) {
            return response()->download($fullPath, $downloadName);
        }

        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function sendOriginals(Request $request, AiPhotoRequest $photoRequest): RedirectResponse
    {
        @set_time_limit(300);

        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'original_files' => ['nullable', 'array'],
            'original_files.*' => ['file'],
        ]);

        $uploadedFiles = $request->file('original_files', []);
        $matchedOriginalCount = 0;

        DB::transaction(function () use ($photoRequest, $validated, $uploadedFiles, &$matchedOriginalCount) {
            $photoRequest->load('items.photo');

            // Petakan file asli resolusi penuh yang diunggah Admin berdasarkan nama file
            $byExactName = [];
            $byStem = [];
            foreach ($uploadedFiles as $uFile) {
                $nameLower = strtolower(trim($uFile->getClientOriginalName()));
                $stemLower = strtolower(pathinfo($nameLower, PATHINFO_FILENAME));
                $byExactName[$nameLower] = $uFile;
                $byStem[$stemLower] = $uFile;
            }

            foreach ($photoRequest->items as $idx => $item) {
                $targetOrigName = strtolower(trim((string) ($item->photo?->original_filename ?? '')));
                $targetStem = strtolower(pathinfo($targetOrigName, PATHINFO_FILENAME));

                $chosenFile = null;
                if ($targetOrigName !== '' && isset($byExactName[$targetOrigName])) {
                    $chosenFile = $byExactName[$targetOrigName];
                } elseif ($targetStem !== '' && isset($byStem[$targetStem])) {
                    $chosenFile = $byStem[$targetStem];
                } elseif (count($uploadedFiles) === 1 && $photoRequest->items->count() === 1) {
                    $chosenFile = $uploadedFiles[0];
                } elseif (count($uploadedFiles) === $photoRequest->items->count() && isset($uploadedFiles[$idx])) {
                    $chosenFile = $uploadedFiles[$idx];
                }

                $deliveredPath = $item->photo?->original_file_path;
                if ($chosenFile) {
                    $ext = strtolower($chosenFile->getClientOriginalExtension() ?: 'jpg');
                    $storedName = $item->id.'_'.\Illuminate\Support\Str::uuid().'.'.$ext;
                    $deliveredPath = Storage::disk('local')->putFileAs(
                        "ai_paid_originals/{$photoRequest->id}",
                        $chosenFile,
                        $storedName
                    );
                    $matchedOriginalCount++;
                }

                if ($deliveredPath) {
                    $item->update([
                        'is_original_unlocked' => true,
                        'delivered_original_file_path' => $deliveredPath,
                    ]);
                }
            }

            $photoRequest->update([
                'status' => 'SENT_BY_ADMIN',
                'payment_confirmed_at' => now(),
                'admin_notes' => ! empty($validated['admin_notes'])
                    ? $validated['admin_notes']
                    : ($matchedOriginalCount > 0
                        ? "Pembayaran dikonfirmasi. {$matchedOriginalCount} file foto ukuran asli penuh tanpa watermark siap diunduh."
                        : 'Pembayaran dikonfirmasi. Foto asli tanpa watermark sudah tersedia di menu Unduh.'),
                'sent_at' => now(),
            ]);
        });

        $msg = $matchedOriginalCount > 0
            ? "Pembayaran {$photoRequest->request_code} dikonfirmasi dan {$matchedOriginalCount} file ukuran asli penuh berhasil dikirim ke pelanggan."
            : "Pembayaran {$photoRequest->request_code} dikonfirmasi dan foto tanpa watermark sudah dikirim ke pelanggan.";

        return back()->with('success', $msg);
    }

    public function cancelRequest(Request $request, AiPhotoRequest $photoRequest): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($photoRequest, $validated) {
            $photoRequest->items()->update([
                'is_original_unlocked' => false,
            ]);

            $photoRequest->update([
                'status' => 'CANCELLED',
                'admin_notes' => $validated['admin_notes'] ?? 'Pesanan dibatalkan oleh Admin.',
            ]);
        });

        return back()->with('success', "Pesanan {$photoRequest->request_code} telah dibatalkan.");
    }

    public function customers(): Response
    {
        $customers = User::where('role', 'customer')
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'whatsapp_number' => $u->whatsapp_number ?: $u->phone,
                'free_photo_quota' => (int) ($u->free_photo_quota ?? 0),
                'face_scans_count' => AiFaceScan::where('customer_id', $u->id)->count(),
                'photo_requests_count' => AiPhotoRequest::where('customer_id', $u->id)->count(),
                'last_login_at' => $u->last_login_at?->format('d M Y H:i'),
                'last_login_ip' => $u->last_login_ip,
                'created_at' => $u->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/LangitLens/Customers', [
            'customers' => $customers,
        ])->with('adminPortal', app(AdminDashboardController::class)->portalProps());
    }

    public function destroyCustomer(Request $request, User $customer): RedirectResponse
    {
        if (
            $customer->role !== 'customer'
            || in_array($customer->role, ['admin', 'superadmin'], true)
            || $customer->id === $request->user()?->id
        ) {
            return back()->with('error', 'Akun admin tidak dapat dihapus melalui menu Pelanggan Scan.');
        }

        $label = $customer->name ?: ($customer->username ?: $customer->email);

        ClientDeliveryStorageCleanup::deleteCustomer($customer);

        return back()->with('success', "Akun pelanggan \"{$label}\" beserta seluruh data & file terkait berhasil dihapus tuntas.");
    }
}
