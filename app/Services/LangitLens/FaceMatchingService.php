<?php

namespace App\Services\LangitLens;

use App\Models\AiPhotoFace;

/**
 * Pencocokan wajah tingkat industri (InsightFace ArcFace 512-D & kompatibilitas 128-D).
 *
 * Untuk InsightFace ArcFace 512-D (L2-normalized):
 *   - Cosine Similarity = dot(a, b) ∈ [-1, 1]
 *   - Orang yang sama (frontal): umumnya cosine >= 0.48 – 0.85
 *   - Orang yang sama (samping / jarak jauh): umumnya cosine >= 0.35 – 0.55
 *   - Orang berbeda (termasuk dalam foto rombongan): umumnya cosine < 0.24
 */
class FaceMatchingService
{
    /** Wajah katalog selebar < 28px diabaikan karena terlalu buram. */
    public const MIN_FACE_PX = 28;

    /** Wajah katalog 28-64px dinilai lebih ketat. */
    public const SMALL_FACE_PX = 64;

    // Ambang batas InsightFace ArcFace 512-D (Cosine Similarity, makin BESAR makin mirip)
    public const ARCFACE_FRONT_MIN_COS = 0.38;

    public const ARCFACE_SIDE_MIN_COS = 0.36;

    public const ARCFACE_AVG_MIN_COS = 0.30;

    public const ARCFACE_SINGLE_MIN_COS = 0.40;

    public const ARCFACE_CONSISTENCY_MIN_COS = 0.25;

    // Ambang batas legacy 128-D (Euclidean Distance L2, makin KECIL makin mirip)
    public const LEGACY_FRONT_MAX = 0.30;

    public const LEGACY_SIDE_MAX = 0.27;

    public const LEGACY_AVG_MAX = 0.34;

    public const LEGACY_SINGLE_MAX = 0.28;

    public const LEGACY_CONSISTENCY_MAX = 0.42;

    /**
     * @param  array<mixed>  $queryEmbeddingsInput
     * @return array<int, array{photo_id: int, distance: float, similarity_percent: int, matched_pose: string}>
     */
    public function findMatchingPhotos(array $queryEmbeddingsInput): array
    {
        $poses = $this->normalizeQueryInput($queryEmbeddingsInput);
        if (count($poses) === 0) {
            return [];
        }

        $firstVec = reset($poses);
        $queryDim = count($firstVec);
        $isArcFace = $queryDim >= 256;
        $multiAngle = isset($poses['front']) && count($poses) >= 3;

        $best = [];

        AiPhotoFace::query()
            ->join('ai_photos', 'ai_photos.id', '=', 'ai_photo_faces.photo_id')
            ->select([
                'ai_photo_faces.photo_id',
                'ai_photo_faces.face_embedding',
                'ai_photo_faces.bounding_box',
                'ai_photos.original_width',
            ])
            ->chunk(500, function ($faces) use ($poses, $queryDim, $isArcFace, $multiAngle, &$best) {
                foreach ($faces as $face) {
                    $target = is_array($face->face_embedding) ? $this->l2Normalize($face->face_embedding) : null;
                    if ($target === null || count($target) !== $queryDim) {
                        continue;
                    }

                    $box = is_array($face->bounding_box) ? $face->bounding_box : [];
                    $faceWidthPx = (float) ($box['width'] ?? 0) * (int) $face->original_width;
                    if ($faceWidthPx > 0 && $faceWidthPx < self::MIN_FACE_PX) {
                        continue;
                    }

                    $isSmallFace = ($faceWidthPx > 0 && $faceWidthPx < self::SMALL_FACE_PX);

                    if ($isArcFace) {
                        $cosByPose = [];
                        foreach ($poses as $key => $vec) {
                            $cosByPose[$key] = $this->cosineSimilarity($vec, $target);
                        }

                        $smallBoost = $isSmallFace ? 0.03 : 0.0;

                        if ($multiAngle) {
                            $cFront = $cosByPose['front'];
                            $cLeft = $cosByPose['left'] ?? -1.0;
                            $cRight = $cosByPose['right'] ?? -1.0;
                            $cSide = max($cLeft, $cRight);
                            $cAvg = array_sum($cosByPose) / count($cosByPose);

                            $frontMatch = $cFront >= (self::ARCFACE_FRONT_MIN_COS + $smallBoost)
                                && $cAvg >= (self::ARCFACE_AVG_MIN_COS + $smallBoost);
                            $sideMatch = $cSide >= (self::ARCFACE_SIDE_MIN_COS + $smallBoost)
                                && $cAvg >= (self::ARCFACE_AVG_MIN_COS + $smallBoost);

                            if (! $frontMatch && ! $sideMatch) {
                                continue;
                            }

                            $bestCos = max($cFront, $cSide);
                            $pose = $cFront >= $cSide ? 'front' : ($cLeft >= $cRight ? 'left' : 'right');
                        } else {
                            $bestCos = max($cosByPose);
                            if ($bestCos < (self::ARCFACE_SINGLE_MIN_COS + $smallBoost)) {
                                continue;
                            }
                            $pose = (string) array_search($bestCos, $cosByPose, true);
                        }

                        $distance = sqrt(max(0.0, 2.0 * (1.0 - $bestCos)));
                        // Skala persentase intuitif untuk ArcFace (0.36 -> ~80%, 0.65+ -> 98-99%)
                        $simPercent = (int) round(max(60, min(99, 55 + ($bestCos * 65))));
                    } else {
                        // Legacy 128-D Euclidean mode
                        $strict = $isSmallFace ? 0.9 : 1.0;
                        $d = [];
                        foreach ($poses as $key => $vec) {
                            $d[$key] = $this->euclideanDistance($vec, $target);
                        }

                        if ($multiAngle) {
                            $dFront = $d['front'];
                            $dSide = min($d['left'] ?? 9, $d['right'] ?? 9);
                            $avg = array_sum($d) / count($d);

                            $frontMatch = $dFront <= self::LEGACY_FRONT_MAX * $strict && $avg <= self::LEGACY_AVG_MAX * $strict;
                            $sideMatch = $dSide <= self::LEGACY_SIDE_MAX * $strict && $avg <= (self::LEGACY_AVG_MAX - 0.01) * $strict;

                            if (! $frontMatch && ! $sideMatch) {
                                continue;
                            }
                            $distance = $frontMatch ? $dFront : $dSide;
                            $pose = $frontMatch ? 'front' : ($d['left'] <= $d['right'] ? 'left' : 'right');
                        } else {
                            $distance = min($d);
                            if ($distance > self::LEGACY_SINGLE_MAX * $strict) {
                                continue;
                            }
                            $pose = (string) array_search($distance, $d, true);
                        }

                        $cos = 1.0 - ($distance ** 2) / 2.0;
                        $simPercent = (int) round(max(0, min(1, $cos)) * 100);
                    }

                    $pid = (int) $face->photo_id;
                    if (! isset($best[$pid]) || $distance < $best[$pid]['distance']) {
                        $best[$pid] = [
                            'distance' => $distance,
                            'similarity_percent' => $simPercent,
                            'pose' => $pose,
                        ];
                    }
                }
            });

        uasort($best, fn ($a, $b) => $a['distance'] <=> $b['distance']);

        $results = [];
        foreach ($best as $pid => $info) {
            $results[] = [
                'photo_id' => $pid,
                'distance' => round($info['distance'], 4),
                'similarity_percent' => $info['similarity_percent'],
                'matched_pose' => $info['pose'],
            ];
        }

        return $results;
    }

    /**
     * Pastikan ke-3 sudut scan berasal dari orang yang sama.
     *
     * @param  array<mixed>  $poseEmbeddings
     */
    public function validateMultiAngleConsistency(array $poseEmbeddings): bool
    {
        $vectors = array_values($this->normalizeQueryInput($poseEmbeddings));
        $n = count($vectors);
        if ($n <= 1) {
            return true;
        }

        $isArcFace = count($vectors[0]) >= 256;

        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                if (count($vectors[$i]) !== count($vectors[$j])) {
                    return false;
                }
                if ($isArcFace) {
                    if ($this->cosineSimilarity($vectors[$i], $vectors[$j]) < self::ARCFACE_CONSISTENCY_MIN_COS) {
                        return false;
                    }
                } else {
                    if ($this->euclideanDistance($vectors[$i], $vectors[$j]) > self::LEGACY_CONSISTENCY_MAX) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * @param  array<mixed>  $input
     * @return array<string, array<int, float>>
     */
    private function normalizeQueryInput(array $input): array
    {
        if (count($input) === 0) {
            return [];
        }

        if (is_numeric(reset($input))) {
            $v = $this->l2Normalize($input);

            return $v ? ['front' => $v] : [];
        }

        $out = [];
        foreach ($input as $key => $vec) {
            if (is_array($vec) && count($vec) >= 64) {
                $v = $this->l2Normalize($vec);
                if ($v !== null) {
                    $out[(string) $key] = $v;
                }
            }
        }

        return $out;
    }

    /**
     * @param  array<int, mixed>  $vec
     * @return array<int, float>|null
     */
    private function l2Normalize(array $vec): ?array
    {
        $floats = array_map('floatval', array_values($vec));
        $norm = sqrt(array_sum(array_map(fn ($f) => $f * $f, $floats)));

        return $norm < 1e-8 ? null : array_map(fn ($f) => $f / $norm, $floats);
    }

    /**
     * @param  array<int, float>  $a
     * @param  array<int, float>  $b
     */
    private function euclideanDistance(array $a, array $b): float
    {
        $sum = 0.0;
        $n = count($a);
        for ($i = 0; $i < $n; $i++) {
            $diff = $a[$i] - $b[$i];
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }

    /**
     * @param  array<int, float>  $a
     * @param  array<int, float>  $b
     */
    private function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $n = count($a);
        for ($i = 0; $i < $n; $i++) {
            $dot += $a[$i] * $b[$i];
        }

        return $dot;
    }
}
