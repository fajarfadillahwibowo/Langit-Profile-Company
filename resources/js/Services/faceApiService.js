import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let loadingPromise = null;

export async function loadFaceModels() {
    if (modelsLoaded) return;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        const MODEL_URL = '/models/face-api';
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        modelsLoaded = true;
    })();

    return loadingPromise;
}

function fileToImageElement(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
        img.src = url;
    });
}

function createScaledCanvas(source, maxSide = 1280, mirrorHorizontal = false) {
    const srcW = source.videoWidth || source.naturalWidth || source.width;
    const srcH = source.videoHeight || source.naturalHeight || source.height;
    const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (mirrorHorizontal) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(source, 0, 0, width, height);

    return { canvas, width, height };
}

/**
 * Normalisasi L2 pada vektor 128-D agar perhitungan jarak biometrik konsisten & tahan variasi pencahayaan.
 */
export function normalizeDescriptor(desc) {
    const arr = Array.from(desc, (v) => Number(v));
    let sumSq = 0;
    for (let i = 0; i < arr.length; i++) {
        sumSq += arr[i] * arr[i];
    }
    const norm = Math.sqrt(sumSq) || 1;
    return arr.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * Hitung sudut kemiringan wajah (Yaw) dari 68 titik landmark untuk mendeteksi:
 * - Wajah Depan (frontal)
 * - Wajah Samping Kiri / Setengah Wajah (side_left)
 * - Wajah Samping Kanan / Setengah Wajah (side_right)
 */
export function estimateFacePose(landmarks) {
    try {
        const positions = landmarks.positions;
        if (!positions || positions.length < 68) {
            return { pose: 'frontal', yawRatio: 0.5, label: 'Wajah Depan' };
        }

        // Titik ujung hidung (30), tepi rahang kiri (1..3), tepi rahang kanan (13..15)
        const noseTip = positions[30];
        const leftJawX = (positions[1].x + positions[2].x + positions[3].x) / 3;
        const rightJawX = (positions[13].x + positions[14].x + positions[15].x) / 3;
        const faceSpan = Math.max(1, rightJawX - leftJawX);

        const yawRatio = (noseTip.x - leftJawX) / faceSpan;

        if (yawRatio < 0.37) {
            return {
                pose: 'side_left',
                yawRatio: Number(yawRatio.toFixed(3)),
                label: 'Samping (Setengah Wajah)',
            };
        }
        if (yawRatio > 0.63) {
            return {
                pose: 'side_right',
                yawRatio: Number(yawRatio.toFixed(3)),
                label: 'Samping (Setengah Wajah)',
            };
        }

        return {
            pose: 'frontal',
            yawRatio: Number(yawRatio.toFixed(3)),
            label: 'Wajah Depan',
        };
    } catch {
        return { pose: 'frontal', yawRatio: 0.5, label: 'Wajah Depan' };
    }
}

/**
 * Buat thumbnail crop wajah untuk ditampilkan di kartu preview 3 sudut scan pelanggan.
 */
function cropFaceThumbnail(canvas, box, width, height) {
    try {
        const padX = box.width * 0.25;
        const padY = box.height * 0.25;
        const sx = Math.max(0, box.x - padX);
        const sy = Math.max(0, box.y - padY);
        const sw = Math.min(width - sx, box.width + padX * 2);
        const sh = Math.min(height - sy, box.height + padY * 2);

        const thumb = document.createElement('canvas');
        thumb.width = 160;
        thumb.height = 160;
        const ctx = thumb.getContext('2d');
        ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 160, 160);
        return thumb.toDataURL('image/jpeg', 0.88);
    } catch {
        return null;
    }
}

function computeIoU(a, b) {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const union = areaA + areaB - inter;
    return union > 0 ? inter / union : 0;
}

function deduplicateFaces(faces) {
    const sorted = [...faces].sort((a, b) => b.confidence_score - a.confidence_score);
    const kept = [];
    for (const face of sorted) {
        const overlaps = kept.some((k) => computeIoU(k.bounding_box, face.bounding_box) > 0.35);
        if (!overlaps) kept.push(face);
    }
    return kept;
}

/**
 * Deteksi semua wajah dari HTMLImageElement (mendukung foto full-body/jarak jauh via multi-crop zoom).
 */
export async function extractFacesFromImageElement(img) {
    await loadFaceModels();
    const { canvas, width, height } = createScaledCanvas(img, 1280, false);

    // Pass 1: Deteksi seluruh frame
    const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.34 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

    const results = [];

    for (const det of detections) {
        const box = det.detection.box;
        if (box.width / width < 0.022 || box.height / height < 0.022) {
            continue;
        }
        const poseInfo = estimateFacePose(det.landmarks);
        results.push({
            face_embedding: normalizeDescriptor(det.descriptor),
            confidence_score: Number(det.detection.score.toFixed(4)),
            bounding_box: {
                x: Number((box.x / width).toFixed(4)),
                y: Number((box.y / height).toFixed(4)),
                width: Number((box.width / width).toFixed(4)),
                height: Number((box.height / height).toFixed(4)),
                pose: poseInfo.pose,
                yaw_ratio: poseInfo.yawRatio,
            },
        });
    }

    // Pass 2: Jika belum ditemukan wajah (misal foto full-body jarak jauh / samping), zoom region 2x2 + tengah-atas
    if (results.length === 0) {
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;
        const regions = [
            { rx: 0.2, ry: 0.1, rw: 0.6, rh: 0.6 }, // tengah-atas (umum untuk foto full-body)
            { rx: 0, ry: 0, rw: 0.6, rh: 0.6 },
            { rx: 0.4, ry: 0, rw: 0.6, rh: 0.6 },
            { rx: 0, ry: 0.4, rw: 0.6, rh: 0.6 },
            { rx: 0.4, ry: 0.4, rw: 0.6, rh: 0.6 },
        ];

        for (const reg of regions) {
            const tile = document.createElement('canvas');
            tile.width = 960;
            tile.height = 960;
            const tCtx = tile.getContext('2d');
            tCtx.drawImage(
                img,
                reg.rx * srcW,
                reg.ry * srcH,
                reg.rw * srcW,
                reg.rh * srcH,
                0,
                0,
                960,
                960
            );

            const tileDets = await faceapi
                .detectAllFaces(tile, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.30 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            for (const det of tileDets) {
                const box = det.detection.box;
                const poseInfo = estimateFacePose(det.landmarks);
                results.push({
                    face_embedding: normalizeDescriptor(det.descriptor),
                    confidence_score: Number(det.detection.score.toFixed(4)),
                    bounding_box: {
                        x: Number((reg.rx + (box.x / 960) * reg.rw).toFixed(4)),
                        y: Number((reg.ry + (box.y / 960) * reg.rh).toFixed(4)),
                        width: Number(((box.width / 960) * reg.rw).toFixed(4)),
                        height: Number(((box.height / 960) * reg.rh).toFixed(4)),
                        pose: poseInfo.pose,
                        yaw_ratio: poseInfo.yawRatio,
                    },
                });
            }
        }
    }

    // Pass 3: Mirror pass jika foto samping ekstrem masih belum terbaca
    if (results.length === 0) {
        const mirrored = createScaledCanvas(img, 1280, true);
        const mirrorDetections = await faceapi
            .detectAllFaces(mirrored.canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.30 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

        for (const det of mirrorDetections) {
            const box = det.detection.box;
            const poseInfo = estimateFacePose(det.landmarks);
            results.push({
                face_embedding: normalizeDescriptor(det.descriptor),
                confidence_score: Number(det.detection.score.toFixed(4)),
                bounding_box: {
                    x: Number(((width - (box.x + box.width)) / width).toFixed(4)),
                    y: Number((box.y / height).toFixed(4)),
                    width: Number((box.width / width).toFixed(4)),
                    height: Number((box.height / height).toFixed(4)),
                    pose: poseInfo.pose,
                    yaw_ratio: poseInfo.yawRatio,
                },
            });
        }
    }

    return deduplicateFaces(results);
}

/**
 * Deteksi semua wajah dari File gambar saat Admin Upload Foto Massal.
 * Mendukung deteksi wajah dari depan maupun dari samping (setengah wajah terlihat).
 */
export async function extractFacesFromFile(file) {
    const img = await fileToImageElement(file);
    return extractFacesFromImageElement(img);
}

/**
 * Deteksi semua wajah dari Kamera / Foto Selfie Pelanggan atau Re-index Admin.
 */
export async function detectFacesFromSource(sourceElement, { mirrorHorizontal = false } = {}) {
    await loadFaceModels();
    const { canvas, width, height } = createScaledCanvas(sourceElement, 1280, mirrorHorizontal);

    const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const faces = detections
        .filter((det) => {
            const box = det.detection.box;
            return box.width / width >= 0.03 && box.height / height >= 0.03;
        })
        .map((det, idx) => {
            const box = det.detection.box;
            const poseInfo = estimateFacePose(det.landmarks);
            return {
                index: idx,
                face_embedding: normalizeDescriptor(det.descriptor),
                confidence_score: Number(det.detection.score.toFixed(4)),
                pose: poseInfo.pose,
                pose_label: poseInfo.label,
                yaw_ratio: poseInfo.yawRatio,
                thumb_url: cropFaceThumbnail(canvas, box, width, height),
                bounding_box: {
                    x: Number((box.x / width).toFixed(4)),
                    y: Number((box.y / height).toFixed(4)),
                    width: Number((box.width / width).toFixed(4)),
                    height: Number((box.height / height).toFixed(4)),
                    pose: poseInfo.pose,
                    yaw_ratio: poseInfo.yawRatio,
                },
            };
        });

    return {
        snapshotDataUrl: dataUrl,
        width,
        height,
        faces,
    };
}
