<?php

namespace App\Http\Controllers;

use App\Models\AiDiscountRule;
use App\Models\AiFaceScan;
use App\Models\AiPhoto;
use App\Models\AiPhotoRequest;
use App\Models\AiRequestItem;
use App\Models\User;
use App\Services\LangitLens\FaceMatchingService;
use App\Services\LangitLens\InsightFaceClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    public function scanPage(Request $request, InsightFaceClient $insightFace): Response
    {
        $lastScan = AiFaceScan::where('customer_id', $request->user()->id)
            ->latest('scanned_at')
            ->first();

        return Inertia::render('ScanFoto/FaceScan', [
            'hasPreviousScan' => (bool) $lastScan || is_array($request->session()->get('matched_photo_ids')),
            'lastMatchedCount' => count($request->session()->get('matched_photo_ids', [])),
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

    public function submitFaceScan(Request $request, FaceMatchingService $matcher): JsonResponse
    {
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

        AiFaceScan::create([
            'customer_id' => $request->user()->id,
            'selected_face_embedding' => $embeddingsPayload,
            'selected_box' => $validated['selected_boxes'] ?? ($validated['selected_box'] ?? null),
            'matched_photo_ids' => $matchedIds,
            'scanned_at' => now(),
        ]);

        $request->session()->put('matched_photo_ids', $matchedIds);
        $request->session()->put('matched_photo_scores', $matchedScores);

        return response()->json([
            'success' => true,
            'matchedCount' => count($matchedIds),
            'redirectUrl' => route('scan.photos'),
        ]);
    }

    public function photos(Request $request): Response|RedirectResponse
    {
        $matchedIds = $request->session()->get('matched_photo_ids');
        if (! is_array($matchedIds)) {
            return redirect()->route('scan.index')
                ->with('error', 'Langkah 1 wajib: Silakan scan wajah Anda terlebih dahulu untuk menemukan foto Anda.');
        }

        $matchedScores = $request->session()->get('matched_photo_scores', []);
        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));
        $user = $request->user();

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

        $hasUsedFreeQuota = (int) ($user->free_photo_quota ?? 0) <= 0
            || $user->free_photo_used_at !== null
            || AiPhotoRequest::where('customer_id', $user->id)->where('request_code', 'like', 'FREE-%')->exists();
        $remainingFreeQuota = $hasUsedFreeQuota ? 0 : (int) ($user->free_photo_quota ?? 0);

        return Inertia::render('ScanFoto/MatchedPhotos', [
            'photos' => $photos,
            'cartIds' => $cartIds,
            'discountRule' => AiDiscountRule::current(),
            'freePhotoQuota' => $remainingFreeQuota,
            'freePhotoUsedAt' => $user->free_photo_used_at?->format('d M Y H:i'),
        ]);
    }

    public function claimFreePhoto(Request $request, AiPhoto $photo): RedirectResponse
    {
        $matchedIds = array_map('intval', $request->session()->get('matched_photo_ids', []));
        if (! in_array($photo->id, $matchedIds, true)) {
            return back()->with('error', 'Foto tersebut tidak ada di hasil scan wajah Anda.');
        }

        $result = DB::transaction(function () use ($request, $photo) {
            $lockedUser = User::where('id', $request->user()->id)->lockForUpdate()->first();

            $alreadyUsedOnAccount = ! $lockedUser
                || (int) $lockedUser->free_photo_quota <= 0
                || $lockedUser->free_photo_used_at !== null
                || AiPhotoRequest::where('customer_id', $lockedUser->id)->where('request_code', 'like', 'FREE-%')->exists();

            if ($alreadyUsedOnAccount) {
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

                    return ['status' => 'no_quota'];
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

    public function toggleCart(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'photo_id' => ['required', 'integer', 'exists:ai_photos,id'],
        ]);

        $matchedIds = array_map('intval', $request->session()->get('matched_photo_ids', []));
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

    public function cart(Request $request): Response|RedirectResponse
    {
        $matchedIds = $request->session()->get('matched_photo_ids');
        if (! is_array($matchedIds)) {
            return redirect()->route('scan.index')
                ->with('error', 'Silakan scan wajah Anda terlebih dahulu.');
        }

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

    public function submitRequest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_notes' => ['nullable', 'string', 'max:1000'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
        ]);

        $matchedIds = array_map('intval', $request->session()->get('matched_photo_ids', []));
        $cartIds = array_map('intval', $request->session()->get('customer_cart_ids', []));

        $validIds = array_values(array_intersect($cartIds, $matchedIds));
        if (count($validIds) === 0) {
            return back()->with('error', 'Keranjang pilihan Anda masih kosong. Pilih minimal 1 foto terlebih dahulu.');
        }

        if (! empty($validated['whatsapp_number'])) {
            $request->user()->update(['whatsapp_number' => $validated['whatsapp_number']]);
        }

        $photos = AiPhoto::whereIn('id', $validIds)->get();
        $rule = AiDiscountRule::current();
        $pricing = $this->calculatePricing($photos->pluck('price')->all(), $rule);

        $photoRequest = DB::transaction(function () use ($request, $photos, $pricing, $validated) {
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
                'customer_notes' => $validated['customer_notes'] ?? null,
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
            ->with('success', "Permintaan foto {$photoRequest->request_code} berhasil dikirim ke Admin! Silakan lakukan pembayaran manual agar Admin segera mengirimkan foto asli resolusi penuh Anda.");
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
