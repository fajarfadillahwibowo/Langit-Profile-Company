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

        return Inertia::render('Admin/LangitLens/Dashboard', [
            'stats' => [
                'totalPhotos' => $totalPhotos,
                'totalOriginalBytes' => (int) AiPhoto::sum('original_size_bytes'),
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

        return Inertia::render('Admin/LangitLens/Photos', [
            'photos' => $photos,
            'defaultPrice' => $rule->default_photo_price,
            'discountRule' => $rule,
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
        ]);

        $file = $request->file('photo');
        $rule = AiDiscountRule::current();
        $price = $request->filled('price') ? (float) $request->input('price') : $rule->default_photo_price;

        $processed = $imageService->processUpload($file, null, null, true);
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

        $photo = DB::transaction(function () use ($request, $processed, $price, $facesData) {
            $photo = AiPhoto::create([
                'uploaded_by_admin_id' => $request->user()->id,
                'title' => $request->input('title') ?: pathinfo($processed['original_filename'], PATHINFO_FILENAME),
                'original_filename' => $processed['original_filename'],
                'original_file_path' => $processed['original_file_path'],
                'preview_watermarked_path' => $processed['preview_watermarked_path'],
                'original_width' => $processed['original_width'],
                'original_height' => $processed['original_height'],
                'original_size_bytes' => $processed['original_size_bytes'],
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

    public function reindexAllInsightFace(InsightFaceClient $insightFace): JsonResponse
    {
        @set_time_limit(600);

        if (! $insightFace->isHealthy()) {
            return response()->json([
                'success' => false,
                'message' => 'InsightFace server belum aktif di port 8001.',
            ], 503);
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

        return response()->json([
            'success' => true,
            'processed_photos' => $processed,
            'total_faces' => $totalFaces,
        ]);
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

    public function updateDiscount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'min_photos_selected' => ['required', 'integer', 'min:1', 'max:100'],
            'discount_percentage' => ['required', 'numeric', 'min:0', 'max:95'],
            'default_photo_price' => ['required', 'numeric', 'min:0'],
            'admin_whatsapp' => ['required', 'string', 'max:30'],
            'manual_payment_info' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $rule = AiDiscountRule::current();
        $rule->update($validated);

        return back()->with('success', 'Pengaturan diskon, harga dasar, dan info pembayaran berhasil disimpan.');
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
        ])->with('adminPortal', app(AdminDashboardController::class)->portalProps());
    }

    public function sendOriginals(Request $request, AiPhotoRequest $photoRequest): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($photoRequest, $validated) {
            $photoRequest->load('items.photo');

            foreach ($photoRequest->items as $item) {
                if ($item->photo) {
                    $item->update([
                        'is_original_unlocked' => true,
                        'delivered_original_file_path' => $item->photo->original_file_path,
                    ]);
                }
            }

            $photoRequest->update([
                'status' => 'SENT_BY_ADMIN',
                'admin_notes' => $validated['admin_notes'] ?? 'Pembayaran manual diterima. Foto asli resolusi penuh tanpa watermark telah dikirim ke portal pelanggan.',
                'sent_at' => now(),
            ]);
        });

        return back()->with('success', "Foto asli resolusi penuh tanpa watermark untuk pesanan {$photoRequest->request_code} berhasil dikirim ke pelanggan!");
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
