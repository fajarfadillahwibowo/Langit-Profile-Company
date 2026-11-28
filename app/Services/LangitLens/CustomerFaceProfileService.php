<?php

namespace App\Services\LangitLens;

use App\Models\AiFaceScan;
use App\Models\AiPhoto;
use App\Models\AiPhotoFace;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerFaceProfileService
{
    public function __construct(
        private readonly FaceMatchingService $matcher
    ) {}

    /**
     * Ambil riwayat scan 3 wajah permanen milik akun pelanggan.
     */
    public function latestScan(User $user): ?AiFaceScan
    {
        return AiFaceScan::where('customer_id', $user->id)
            ->latest('scanned_at')
            ->latest('id')
            ->first();
    }

    public function hasPermanentScan(User $user): bool
    {
        return AiFaceScan::where('customer_id', $user->id)->exists();
    }

    /**
     * Sidik versi katalog foto & indeks wajah agar hasil cocok otomatis diperbarui
     * bila Admin mengunggah atau menghapus foto baru tanpa perlu scan wajah ulang.
     */
    public function catalogSignature(): string
    {
        $photoCount = AiPhoto::count();
        $photoMax = (string) (AiPhoto::max('updated_at') ?? '');
        $faceCount = AiPhotoFace::count();
        $faceMax = (string) (AiPhotoFace::max('updated_at') ?? '');

        return "{$photoCount}|{$photoMax}|{$faceCount}|{$faceMax}";
    }

    /**
     * Pastikan session pelanggan selalu terisi dari data scan 3 wajah permanen di database.
     * - Setelah logout & login ulang (atau pindah perangkat), hasil foto langsung muncul tanpa scan ulang.
     * - Jika katalog foto di Admin bertambah/berubah, pencocokan otomatis dijalankan ulang
     *   dari embedding permanen milik akun tersebut.
     *
     * @return array{scan: AiFaceScan, matched_ids: array<int, int>, matched_scores: array<int, int>}|null
     */
    public function ensureSessionHydrated(Request $request, User $user, bool $forceRefresh = false): ?array
    {
        $scan = $this->latestScan($user);
        if (! $scan) {
            return null;
        }

        $signature = $this->catalogSignature();
        $sessionIds = $request->session()->get('matched_photo_ids');
        $sessionScores = $request->session()->get('matched_photo_scores');
        $sessionSig = $request->session()->get('matched_catalog_signature');
        $sessionScanId = $request->session()->get('matched_scan_id');

        if (
            ! $forceRefresh
            && is_array($sessionIds)
            && is_array($sessionScores)
            && $sessionSig === $signature
            && (int) $sessionScanId === (int) $scan->id
        ) {
            return [
                'scan' => $scan,
                'matched_ids' => array_map('intval', $sessionIds),
                'matched_scores' => $sessionScores,
            ];
        }

        $embeddingPayload = is_array($scan->selected_face_embedding) ? $scan->selected_face_embedding : [];
        $matchedIds = [];
        $matchedScores = [];

        if (! empty($embeddingPayload)) {
            $matches = $this->matcher->findMatchingPhotos($embeddingPayload);
            foreach ($matches as $match) {
                $pid = (int) $match['photo_id'];
                $matchedIds[] = $pid;
                $matchedScores[$pid] = (int) $match['similarity_percent'];
            }
        } elseif (is_array($scan->matched_photo_ids)) {
            $matchedIds = array_values(array_map('intval', $scan->matched_photo_ids));
            foreach ($matchedIds as $pid) {
                $matchedScores[$pid] = 90;
            }
        }

        // Perbarui riwayat matched_photo_ids permanen di database jika ada foto baru/terhapus
        $existingIds = is_array($scan->matched_photo_ids) ? array_map('intval', $scan->matched_photo_ids) : [];
        if ($existingIds !== $matchedIds) {
            $scan->forceFill(['matched_photo_ids' => $matchedIds])->save();
        }

        $request->session()->put('matched_photo_ids', $matchedIds);
        $request->session()->put('matched_photo_scores', $matchedScores);
        $request->session()->put('matched_catalog_signature', $signature);
        $request->session()->put('matched_scan_id', $scan->id);

        return [
            'scan' => $scan,
            'matched_ids' => $matchedIds,
            'matched_scores' => $matchedScores,
        ];
    }

    /**
     * Ringkasan data riwayat scan permanen untuk ditampilkan ke pelanggan.
     *
     * @return array{id: int, scanned_at: string|null, angles_count: int, matched_count: int}|null
     */
    public function summary(?AiFaceScan $scan, int $matchedCount): ?array
    {
        if (! $scan) {
            return null;
        }

        $emb = is_array($scan->selected_face_embedding) ? $scan->selected_face_embedding : [];
        $anglesCount = (isset($emb['front']) || isset($emb['left']) || isset($emb['right']))
            ? count(array_intersect(['front', 'left', 'right'], array_keys($emb)))
            : 1;

        return [
            'id' => $scan->id,
            'scanned_at' => $scan->scanned_at?->format('d M Y H:i') ?? $scan->created_at?->format('d M Y H:i'),
            'angles_count' => $anglesCount,
            'matched_count' => $matchedCount,
        ];
    }

    /**
     * Cek apakah wajah milik akun ini sudah pernah mengklaim kuota 1 foto gratis
     * di akun pelanggan lain (aturan 1 wajah = 1 foto gratis saja).
     *
     * @param  array<mixed>|null  $embeddingsOverride
     */
    public function hasSameFaceClaimedFreePhotoOnOtherAccount(User $user, ?array $embeddingsOverride = null): bool
    {
        $targetEmbeddings = $embeddingsOverride;
        if (! is_array($targetEmbeddings) || count($targetEmbeddings) === 0) {
            $ownScan = $this->latestScan($user);
            $targetEmbeddings = is_array($ownScan?->selected_face_embedding)
                ? $ownScan->selected_face_embedding
                : [];
        }

        if (count($targetEmbeddings) === 0) {
            return false;
        }

        $foundMatch = false;

        AiFaceScan::query()
            ->join('users', 'users.id', '=', 'ai_face_scans.customer_id')
            ->where('ai_face_scans.customer_id', '!=', $user->id)
            ->where(function ($query) {
                $query->whereNotNull('users.free_photo_used_at')
                    ->orWhereExists(function ($sub) {
                        $sub->selectRaw('1')
                            ->from('ai_photo_requests')
                            ->whereColumn('ai_photo_requests.customer_id', 'users.id')
                            ->where('ai_photo_requests.request_code', 'like', 'FREE-%');
                    });
            })
            ->select([
                'ai_face_scans.id',
                'ai_face_scans.customer_id',
                'ai_face_scans.selected_face_embedding',
            ])
            ->orderBy('ai_face_scans.id')
            ->chunkById(200, function ($scans) use ($targetEmbeddings, &$foundMatch) {
                foreach ($scans as $otherScan) {
                    $otherEmbedding = is_array($otherScan->selected_face_embedding)
                        ? $otherScan->selected_face_embedding
                        : [];

                    if (count($otherEmbedding) > 0 && $this->matcher->areSamePerson($targetEmbeddings, $otherEmbedding)) {
                        $foundMatch = true;

                        return false;
                    }
                }

                return true;
            }, 'ai_face_scans.id', 'id');

        return $foundMatch;
    }
}
