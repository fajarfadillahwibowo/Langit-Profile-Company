<?php

namespace App\Http\Controllers;

use App\Models\AiDiscountRule;
use App\Models\AiFaceScan;
use App\Models\AiPhoto;
use App\Models\AiPhotoRequest;
use App\Models\AiRequestItem;
use App\Models\User;
use App\Services\LangitLens\CustomerFaceProfileService;
use App\Services\LangitLens\FaceMatchingService;
use App\Services\LangitLens\InsightFaceClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class ScanFotoController extends Controller
{
    public function scanPage(
        Request $request,
        InsightFaceClient $insightFace,
        CustomerFaceProfileService $faceProfile
    ): Response {
        $user = $request->user();
        $hydrated = $faceProfile->ensureSessionHydrated($request, $user);
        $savedScan = $hydrated['scan'] ?? null;
        $matchedCount = isset($hydrated['matched_ids']) ? count($hydrated['matched_ids']) : 0;

        return Inertia::render('ScanFoto/FaceScan', [
            'hasPreviousScan' => (bool) $savedScan,
            'lastMatchedCount' => $matchedCount,
            'savedScan' => $faceProfile->summary($savedScan, $matchedCount),
            'totalCatalogPhotos' => AiPhoto::count(),
            'insightFaceReady' => $insightFace->isHealthy(),
        ]);
    }

    public function detectScanFaces(Request $request, InsightFaceClient $insightFace): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file'],
            'mirror_horizontal' => ['nullable', 'boolean'],
            'include_snapshot' => ['nullable', 'boolean'],
        ]);

        $file = $request->file('image');
        $includeSnapshot = $request->has('include_snapshot')
            ? $request->boolean('include_snapshot')
            : true;

        try {
            $result = $insightFace->detectFromPath(
                $file->getRealPath(),
                $request->boolean('mirror_horizontal'),
                $includeSnapshot
            );

            return response()->json([
                'success' => true,
                ...$result,
            ]);
        } catch (\Throwable) {
            return response()->json([
                'success' => false,
                'fallbackToClient' => true,
                'message' => 'InsightFace service sedang offline, beralih ke mode browser.',
            ], 503);
        }
    }

    public function submitFaceScan(
        Request $request,
        FaceMatchingService $matcher,
        CustomerFaceProfileService $faceProfile
    ): JsonResponse {
        $user = $request->user();

        // Scan 3 wajah cukup dilakukan 1 kali dan tersimpan permanen per akun
        if ($faceProfile->hasPermanentScan($user)) {
            $hydrated = $faceProfile->ensureSessionHydrated($request, $user, true);

            return response()->json([
                'success' => true,
                'alreadyScanned' => true,
                'matchedCount' => count($hydrated['matched_ids'] ?? []),
                'redirectUrl' => route('scan.photos'),
                'message' => 'Data scan 3 wajah Anda sudah tersimpan permanen di akun ini.',
            ]);
        }

        $validated = $request->validate([
            'face_embeddings' => ['nullable', 'array'],
            'face_embeddings.front' => ['required_with:face_embeddings', 'array', 'min:64'],
            'face_embeddings.left' => ['required_with:face_embeddings', 'array', 'min:64'],
            'face_embeddings.right' => ['required_with:face_embeddings', 'array', 'min:64'],
            'face_embedding' => ['required_without:face_embeddings', 'array', 'min:64'],
            'selected_boxes' => ['nullable', 'array'],
            'selected_box' => ['nullable', 'array'],
        ]);

        $embeddingsPayload = $validated['face_embeddings'] ?? [
            'front' => $validated['face_embedding'],
        ];

        if (! $matcher->validateMultiAngleConsistency($embeddingsPayload)) {
            return response()->json([
                'success' => false,
                'message' => 'Ke-3 sudut scan wajah tidak konsisten (terdeteksi seperti orang berbeda atau kualitas foto kurang). Silakan ulangi scan dengan pencahayaan terang dan wajah dekat ke kamera.',
            ], 422);
        }

        $matches = $matcher->findMatchingPhotos($embeddingsPayload);

        $matchedIds = array_column($matches, 'photo_id');
        $matchedScores = [];
        foreach ($matches as $m) {
            $matchedScores[$m['photo_id']] = $m['similarity_percent'];
        }

        $scan = AiFaceScan::create([
            'customer_id' => $user->id,
            'selected_face_embedding' => $embeddingsPayload,
            'selected_box' => $validated['selected_boxes'] ?? ($validated['selected_box'] ?? null),
            'matched_photo_ids' => $matchedIds,
            'scanned_at' => now(),
        ]);

        // Aturan 1 wajah = 1 foto gratis: cabut kuota gratis jika wajah ini sudah klaim di akun lain
        if (
            (int) ($user->free_photo_quota ?? 0) > 0
            && $faceProfile->hasSameFaceClaimedFreePhotoOnOtherAccount($user, $embeddingsPayload)
        ) {
            $user->update(['free_photo_quota' => 0]);
        }

        $request->session()->put('matched_photo_ids', $matchedIds);
        $request->session()->put('matched_photo_scores', $matchedScores);
        $request->session()->put('matched_catalog_signature', $faceProfile->catalogSignature());
        $request->session()->put('matched_scan_id', $scan->id);

        return response()->json([
            'success' => true,
            'matchedCount' => count($matchedIds),
            'redirectUrl' => route('scan.photos'),
        ]);
    }

    public function refreshMatches(Request $request, CustomerFaceProfileService $faceProfile): RedirectResponse
    {
        $hydrated = $faceProfile->ensureSessionHydrated($request, $request->user(), true);
        if (! $hydrated) {
            return redirect()->route('scan.index')
                ->with('error', 'Silakan lakukan scan 3 arah wajah terlebih dahulu.');
        }

        $count = count($hydrated['matched_ids']);

        return redirect()->route('scan.photos')
            ->with('success', "Daftar foto diperbarui dari data wajah permanen Anda ({$count} foto ditemukan).");
    }

    public function photos(Request $request, CustomerFaceProfileService $faceProfile): Response|RedirectResponse
    {
        $user = $request->user();
        $hydrated = $faceProfile->ensureSessionHydrated($request, $user);
        if (! $hydrated) {
            return redirect()->route('scan.index')
                ->with('error', 'Langkah 1 wajib: Silakan scan 3 arah wajah Anda satu kali untuk menemukan foto Anda.');
        }

        $matchedIds = $hydrated['matched_ids'];
        $matchedScores = $hydrated['matched_scores'];
        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));

        $unlockedPhotoIds = AiRequestItem::whereHas('photoRequest', fn ($q) => $q->where('customer_id', $user->id))
            ->where('is_original_unlocked', true)
            ->pluck('photo_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $photos = AiPhoto::whereIn('id', $matchedIds ?: [0])
            ->get()
            ->sortBy(fn (AiPhoto $p) => array_search($p->id, $matchedIds))
            ->values()
            ->map(fn (AiPhoto $photo) => [
                'id' => $photo->id,
                'title' => $photo->title ?: $photo->original_filename,
                'preview_url' => Storage::disk('public')->url($photo->preview_watermarked_path),
                'price' => $photo->price,
                'similarity_percent' => $matchedScores[$photo->id] ?? 88,
                'in_cart' => in_array($photo->id, $cartIds, true),
                'is_unlocked' => in_array($photo->id, $unlockedPhotoIds, true),
                'original_width' => $photo->original_width,
                'original_height' => $photo->original_height,
            ]);

        $usedOnThisAccount = $user->free_photo_used_at !== null
            || AiPhotoRequest::where('customer_id', $user->id)->where('request_code', 'like', 'FREE-%')->exists();

        $claimedOnOtherAccount = ! $usedOnThisAccount
            && $faceProfile->hasSameFaceClaimedFreePhotoOnOtherAccount(
                $user,
                is_array($hydrated['scan']?->selected_face_embedding) ? $hydrated['scan']->selected_face_embedding : null
            );

        if ($claimedOnOtherAccount && (int) ($user->free_photo_quota ?? 0) > 0) {
            $user->update(['free_photo_quota' => 0]);
        }

        $hasUsedFreeQuota = $usedOnThisAccount || $claimedOnOtherAccount || (int) ($user->free_photo_quota ?? 0) <= 0;
        $remainingFreeQuota = $hasUsedFreeQuota ? 0 : (int) ($user->free_photo_quota ?? 0);

        return Inertia::render('ScanFoto/MatchedPhotos', [
            'photos' => $photos,
            'cartIds' => $cartIds,
            'discountRule' => AiDiscountRule::current(),
            'freePhotoQuota' => $remainingFreeQuota,
            'freePhotoUsedAt' => $user->free_photo_used_at?->format('d M Y H:i'),
            'freePhotoClaimedOtherAccount' => $claimedOnOtherAccount,
            'savedScan' => $faceProfile->summary($hydrated['scan'], count($matchedIds)),
        ]);
    }

    public function claimFreePhoto(Request $request, AiPhoto $photo, CustomerFaceProfileService $faceProfile): RedirectResponse
    {
        $hydrated = $faceProfile->ensureSessionHydrated($request, $request->user());
        $matchedIds = $hydrated['matched_ids'] ?? [];
        if (! in_array($photo->id, $matchedIds, true)) {
            return back()->with('error', 'Foto tersebut tidak ada di hasil scan wajah Anda.');
        }

        $ownEmbeddings = is_array($hydrated['scan']?->selected_face_embedding)
            ? $hydrated['scan']->selected_face_embedding
            : null;

        $result = Cache::lock('langitlens:free-photo-claim', 10)->block(5, function () use ($request, $photo, $faceProfile, $ownEmbeddings) {
            return DB::transaction(function () use ($request, $photo, $faceProfile, $ownEmbeddings) {
                $lockedUser = User::where('id', $request->user()->id)->lockForUpdate()->first();

                $usedOnThisAccount = ! $lockedUser
                    || $lockedUser->free_photo_used_at !== null
                    || AiPhotoRequest::where('customer_id', $lockedUser->id)->where('request_code', 'like', 'FREE-%')->exists();

                if ($usedOnThisAccount) {
                    return ['status' => 'no_quota'];
                }

                // Cek biometrik 1 wajah = 1 foto gratis lintas semua akun
                if ($faceProfile->hasSameFaceClaimedFreePhotoOnOtherAccount($lockedUser, $ownEmbeddings)) {
                    $lockedUser->update(['free_photo_quota' => 0]);

                    return ['status' => 'claimed_other_account'];
                }

                if ((int) $lockedUser->free_photo_quota <= 0) {
                    return ['status' => 'no_quota'];
                }

                // Cegah duplikasi klaim gratis dengan nomor WhatsApp yang sama
                $waDigits = preg_replace('/\D+/', '', (string) $lockedUser->whatsapp_number);
                if ($waDigits !== '') {
                    $waAlreadyUsed = User::where('id', '!=', $lockedUser->id)
                        ->whereNotNull('free_photo_used_at')
                        ->get(['id', 'whatsapp_number'])
                        ->contains(fn ($u) => preg_replace('/\D+/', '', (string) $u->whatsapp_number) === $waDigits);

                    if ($waAlreadyUsed) {
                        $lockedUser->update(['free_photo_quota' => 0]);

                        return ['status' => 'claimed_other_account'];
                    }
                }

                $alreadyUnlocked = AiRequestItem::whereHas('photoRequest', fn ($q) => $q->where('customer_id', $lockedUser->id))
                    ->where('photo_id', $photo->id)
                    ->where('is_original_unlocked', true)
                    ->exists();

                if ($alreadyUnlocked) {
                    return ['status' => 'already_unlocked'];
                }

                $lockedUser->update([
                    'free_photo_quota' => (int) $lockedUser->free_photo_quota - 1,
                    'free_photo_used_at' => now(),
                    'free_photo_id' => $photo->id,
                ]);

                $code = 'FREE-'.date('Ymd').'-'.strtoupper(Str::random(5));

                $req = AiPhotoRequest::create([
                    'request_code' => $code,
                    'customer_id' => $lockedUser->id,
                    'total_selected_photos' => 1,
                    'subtotal_price' => $photo->price,
                    'discount_percentage_applied' => 100,
                    'discount_amount' => $photo->price,
                    'total_final_price' => 0,
                    'status' => 'SENT_BY_ADMIN',
                    'customer_notes' => 'Klaim kuota gratis 1 foto oleh pelanggan.',
                    'admin_notes' => 'Kuota gratis 1 foto pelanggan — foto asli resolusi penuh tanpa watermark langsung terbuka.',
                    'requested_at' => now(),
                    'sent_at' => now(),
                ]);

                AiRequestItem::create([
                    'request_id' => $req->id,
                    'photo_id' => $photo->id,
                    'price_at_request' => 0,
                    'is_original_unlocked' => true,
                    'delivered_original_file_path' => $photo->original_file_path,
                ]);

                return ['status' => 'ok', 'request' => $req];
            });
        });

        if ($result['status'] === 'claimed_other_account') {
            return back()->with('error', 'Foto gratis Anda sudah diambil di akun lain dengan wajah yang sama.');
        }

        if ($result['status'] === 'no_quota') {
            return back()->with('error', 'Kuota gratis 1 foto Anda sudah digunakan.');
        }

        if ($result['status'] === 'already_unlocked') {
            return redirect()->route('scan.downloads')
                ->with('success', 'Foto ini sudah terbuka di menu Unduhan Anda.');
        }

        // Hapus dari keranjang jika sempat dipilih agar tidak terbayar ganda
        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));
        $cartIds = array_values(array_diff($cartIds, [$photo->id]));
        $request->session()->put('customer_cart_ids', $cartIds);

        return redirect()->route('scan.downloads')
            ->with('success', 'Selamat! 1 foto gratis pilihan Anda berhasil diklaim dan langsung siap diunduh tanpa watermark.');
    }

    public function toggleCart(Request $request, CustomerFaceProfileService $faceProfile): RedirectResponse
    {
        $validated = $request->validate([
            'photo_id' => ['required', 'integer', 'exists:ai_photos,id'],
        ]);

        $hydrated = $faceProfile->ensureSessionHydrated($request, $request->user());
        $matchedIds = $hydrated['matched_ids'] ?? [];
        $photoId = (int) $validated['photo_id'];

        if (! in_array($photoId, $matchedIds, true)) {
            return back()->with('error', 'Foto tersebut tidak ada di hasil scan wajah Anda.');
        }

        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));
        if (in_array($photoId, $cartIds, true)) {
            $cartIds = array_values(array_diff($cartIds, [$photoId]));
        } else {
            $cartIds[] = $photoId;
        }

        $request->session()->put('customer_cart_ids', array_unique($cartIds));

        return back();
    }

    public function cart(Request $request, CustomerFaceProfileService $faceProfile): Response|RedirectResponse
    {
        $hydrated = $faceProfile->ensureSessionHydrated($request, $request->user());
        if (! $hydrated) {
            return redirect()->route('scan.index')
                ->with('error', 'Silakan scan 3 arah wajah Anda terlebih dahulu.');
        }

        $matchedIds = $hydrated['matched_ids'];
        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));
        $selectedPhotos = AiPhoto::whereIn('id', $cartIds ?: [0])
            ->whereIn('id', $matchedIds ?: [0])
            ->get()
            ->map(fn (AiPhoto $photo) => [
                'id' => $photo->id,
                'title' => $photo->title ?: $photo->original_filename,
                'preview_url' => Storage::disk('public')->url($photo->preview_watermarked_path),
                'price' => $photo->price,
            ]);

        $rule = AiDiscountRule::current();
        $pricing = $this->calculatePricing($selectedPhotos->pluck('price')->all(), $rule);

        return Inertia::render('ScanFoto/Cart', [
            'selectedPhotos' => $selectedPhotos,
            'pricing' => $pricing,
            'discountRule' => $rule,
        ]);
    }

    private const ALLOWED_PROOF_EXTENSIONS = [
        'jpg', 'jpeg', 'jpe', 'jfif', 'pjpeg', 'pjp', 'png', 'apng', 'webp', 'gif',
        'bmp', 'dib', 'avif', 'avifs', 'heic', 'heif', 'hif', 'ico', 'tif', 'tiff',
        'jxl', 'jp2', 'j2k', 'tga', 'raw', 'dng', 'cr2', 'cr3', 'nef', 'arw', 'orf',
        'rw2', 'raf', 'pef', 'srw', 'wbmp',
    ];

    public function submitRequest(Request $request, CustomerFaceProfileService $faceProfile): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'in:qris,bank_transfer'],
            'customer_notes' => ['required', 'string', 'max:1000'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'payment_proof' => [
                'required',
                'file',
                'max:5120',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $value instanceof \Illuminate\Http\UploadedFile) {
                        $fail('Bukti foto pembayaran wajib diunggah.');

                        return;
                    }
                    $ext = strtolower((string) $value->getClientOriginalExtension());
                    $mime = strtolower((string) ($value->getMimeType() ?: $value->getClientMimeType()));
                    $isImageMime = str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml';
                    $isAllowedExt = in_array($ext, self::ALLOWED_PROOF_EXTENSIONS, true);
                    if (! $isImageMime && ! $isAllowedExt) {
                        $fail('Bukti pembayaran harus berupa file foto (JPG, PNG, WebP, HEIC, GIF, BMP, TIFF, AVIF, dll.).');
                    }
                },
            ],
        ], [
            'payment_method.required' => 'Pilih metode pembayaran (QRIS atau Rekening Bank).',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
            'customer_notes.required' => 'Tulis pesan konfirmasi pembayaran untuk Admin.',
            'payment_proof.required' => 'Bukti foto pembayaran wajib diunggah.',
            'payment_proof.max' => 'Ukuran file bukti pembayaran maksimal 5 MB.',
        ]);

        $hydrated = $faceProfile->ensureSessionHydrated($request, $request->user());
        $matchedIds = $hydrated['matched_ids'] ?? [];
        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));

        $validIds = array_values(array_intersect($cartIds, $matchedIds));
        if (count($validIds) === 0) {
            return back()->with('error', 'Keranjang pilihan Anda masih kosong. Pilih minimal 1 foto terlebih dahulu.');
        }

        if (! empty($validated['whatsapp_number'])) {
            $request->user()->update(['whatsapp_number' => $validated['whatsapp_number']]);
        }

        $proofFile = $request->file('payment_proof');
        $rawExt = strtolower((string) $proofFile->getClientOriginalExtension());
        $safeExt = in_array($rawExt, self::ALLOWED_PROOF_EXTENSIONS, true) ? $rawExt : 'jpg';
        $subDir = 'ai_payment_proofs/'.date('Y/m');
        $proofFileName = (string) Str::uuid().'.'.$safeExt;
        $storedProofPath = Storage::disk('local')->putFileAs($subDir, $proofFile, $proofFileName);

        $photos = AiPhoto::whereIn('id', $validIds)->get();
        $rule = AiDiscountRule::current();
        $pricing = $this->calculatePricing($photos->pluck('price')->all(), $rule);

        $photoRequest = DB::transaction(function () use ($request, $photos, $pricing, $validated, $storedProofPath, $proofFile) {
            $code = 'REQ-'.date('Ymd').'-'.strtoupper(Str::random(5));

            $req = AiPhotoRequest::create([
                'request_code' => $code,
                'customer_id' => $request->user()->id,
                'total_selected_photos' => $photos->count(),
                'subtotal_price' => $pricing['subtotal'],
                'discount_percentage_applied' => $pricing['discountPercentApplied'],
                'discount_amount' => $pricing['discountAmount'],
                'total_final_price' => $pricing['finalTotal'],
                'status' => 'WAITING_MANUAL_PAYMENT',
                'payment_method' => $validated['payment_method'],
                'payment_proof_path' => $storedProofPath,
                'payment_proof_original_name' => $proofFile->getClientOriginalName(),
                'payment_proof_uploaded_at' => now(),
                'customer_notes' => trim($validated['customer_notes']),
                'requested_at' => now(),
            ]);

            foreach ($photos as $photo) {
                AiRequestItem::create([
                    'request_id' => $req->id,
                    'photo_id' => $photo->id,
                    'price_at_request' => $photo->price,
                    'is_original_unlocked' => false,
                ]);
            }

            return $req;
        });

        $request->session()->forget('customer_cart_ids');

        return redirect()->route('scan.downloads')
            ->with('success', "Konfirmasi pembayaran {$photoRequest->request_code} berhasil dikirim. Menunggu verifikasi Admin untuk membuka foto asli.");
    }

    public function paymentProof(Request $request, AiPhotoRequest $photoRequest): BinaryFileResponse
    {
        if ($photoRequest->customer_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $path = $photoRequest->payment_proof_path;
        if (empty($path) || ! Storage::disk('local')->exists($path)) {
            abort(404, 'Bukti pembayaran tidak ditemukan.');
        }

        $fullPath = Storage::disk('local')->path($path);
        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function downloads(Request $request): Response
    {
        $requests = AiPhotoRequest::with(['items.photo'])
            ->where('customer_id', $request->user()->id)
            ->latest('requested_at')
            ->get()
            ->map(function (AiPhotoRequest $req) {
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
                    'payment_method' => $req->payment_method,
                    'payment_proof_url' => $req->payment_proof_path
                        ? route('scan.downloads.payment-proof', ['photoRequest' => $req->id])
                        : null,
                    'payment_proof_name' => $req->payment_proof_original_name,
                    'payment_proof_uploaded_at' => $req->payment_proof_uploaded_at?->format('d M Y H:i'),
                    'payment_confirmed_at' => $req->payment_confirmed_at?->format('d M Y H:i'),
                    'requested_at' => $req->requested_at?->format('d M Y H:i'),
                    'sent_at' => $req->sent_at?->format('d M Y H:i'),
                    'items' => $req->items->map(fn (AiRequestItem $item) => [
                        'id' => $item->id,
                        'photo_id' => $item->photo_id,
                        'title' => $item->photo?->title ?? 'Foto',
                        'original_filename' => $item->photo?->original_filename ?? 'photo.jpg',
                        'original_width' => $item->photo?->original_width ?? 0,
                        'original_height' => $item->photo?->original_height ?? 0,
                        'original_size_bytes' => $item->photo?->original_size_bytes ?? 0,
                        'price_at_request' => $item->price_at_request,
                        'is_original_unlocked' => $item->is_original_unlocked,
                        'preview_url' => $item->photo
                            ? Storage::disk('public')->url($item->photo->preview_watermarked_path)
                            : null,
                    ]),
                ];
            });

        return Inertia::render('ScanFoto/Downloads', [
            'requests' => $requests,
            'discountRule' => AiDiscountRule::current(),
        ]);
    }

    public function downloadOriginal(Request $request, AiPhotoRequest $photoRequest, AiRequestItem $item): BinaryFileResponse
    {
        if ($photoRequest->customer_id !== $request->user()->id || $item->request_id !== $photoRequest->id) {
            abort(403, 'Anda tidak berhak mengunduh foto ini.');
        }

        if ($photoRequest->status !== 'SENT_BY_ADMIN' || ! $item->is_original_unlocked) {
            abort(403, 'Foto asli belum dikirim oleh Admin. Silakan selesaikan pembayaran manual terlebih dahulu.');
        }

        $relativePath = $item->delivered_original_file_path ?: $item->photo?->original_file_path;
        if (! $relativePath || ! Storage::disk('local')->exists($relativePath)) {
            abort(404, 'File foto asli tidak ditemukan di server.');
        }

        $fullPath = Storage::disk('local')->path($relativePath);
        $downloadName = $item->photo?->original_filename ?: basename($fullPath);

        return response()->download($fullPath, $downloadName);
    }

    public function downloadZip(Request $request, AiPhotoRequest $photoRequest): BinaryFileResponse
    {
        if ($photoRequest->customer_id !== $request->user()->id) {
            abort(403);
        }

        if ($photoRequest->status !== 'SENT_BY_ADMIN') {
            abort(403, 'Foto asli belum dikirim oleh Admin.');
        }

        $photoRequest->load('items.photo');
        $zipPath = storage_path("app/private/temp_{$photoRequest->request_code}.zip");
        @mkdir(dirname($zipPath), 0755, true);

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Gagal membuat arsip ZIP.');
        }

        foreach ($photoRequest->items as $idx => $item) {
            if (! $item->is_original_unlocked) {
                continue;
            }
            $relativePath = $item->delivered_original_file_path ?: $item->photo?->original_file_path;
            if ($relativePath && Storage::disk('local')->exists($relativePath)) {
                $fullPath = Storage::disk('local')->path($relativePath);
                $name = ($idx + 1).'_'.($item->photo?->original_filename ?: basename($fullPath));
                $zip->addFile($fullPath, $name);
            }
        }
        $zip->close();

        return response()->download($zipPath, "{$photoRequest->request_code}_HD_Originals.zip")->deleteFileAfterSend(true);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('ScanFoto/Profile', [
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'whatsapp_number' => ['required', 'string', 'max:30'],
        ]);

        $request->user()->update($validated);

        return back()->with('success', 'Profil & nomor WhatsApp berhasil diperbarui.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'regex:/[a-zA-Z]/', 'regex:/[0-9]/', 'confirmed'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'password.regex' => 'Kata sandi baru wajib mengandung kombinasi huruf dan angka.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'Kata sandi saat ini tidak sesuai.',
            ]);
        }

        if (Hash::check($validated['password'], $user->password)) {
            return back()->withErrors([
                'password' => 'Kata sandi baru tidak boleh sama dengan kata sandi lama.',
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Kata sandi Anda berhasil diperbarui.');
    }

    /**
     * @param  array<int, float>  $prices
     * @return array<string, float|int|bool>
     */
    private function calculatePricing(array $prices, AiDiscountRule $rule): array
    {
        $count = count($prices);
        $subtotal = array_sum($prices);
        $qualifiesDiscount = $rule->is_active && $count >= $rule->min_photos_selected && $count > 0;
        $discountPercent = $qualifiesDiscount ? $rule->discount_percentage : 0.0;
        $discountAmount = $qualifiesDiscount ? round($subtotal * ($discountPercent / 100), 2) : 0.0;
        $finalTotal = max(0, $subtotal - $discountAmount);

        return [
            'count' => $count,
            'subtotal' => $subtotal,
            'qualifiesDiscount' => $qualifiesDiscount,
            'remainingForDiscount' => max(0, $rule->min_photos_selected - $count),
            'discountPercentApplied' => $discountPercent,
            'discountAmount' => $discountAmount,
            'finalTotal' => $finalTotal,
        ];
    }
}
