import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ScanCustomerLayout from '@/Layouts/ScanCustomerLayout';
import { cameraErrorMessage, requestScanCamera } from '@/Utils/scanCamera.mjs';
import {
    Camera,
    Upload,
    ScanFace,
    FlipHorizontal2,
    CheckCircle2,
    Loader2,
    Sparkles,
    AlertTriangle,
    RotateCcw,
    ArrowRight,
    Check,
    X,
    Lock,
} from 'lucide-react';

const ANGLE_STEPS = [
    {
        key: 'front',
        stepNumber: 1,
        title: 'Wajah Depan',
        shortTitle: '1. Depan',
        instruction: 'Hadapkan wajah lurus ke kamera.',
        targetPose: 'frontal',
    },
    {
        key: 'left',
        stepNumber: 2,
        title: 'Samping Kiri',
        shortTitle: '2. Kiri',
        instruction: 'Tolehkan wajah sedikit ke kiri.',
        targetPose: 'side_left',
    },
    {
        key: 'right',
        stepNumber: 3,
        title: 'Samping Kanan',
        shortTitle: '3. Kanan',
        instruction: 'Tolehkan wajah sedikit ke kanan.',
        targetPose: 'side_right',
    },
];

function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const d = a[i] - b[i];
        sum += d * d;
    }
    return Math.sqrt(sum);
}

function cosineSimilarity(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
    }
    return dot;
}

function videoFrameToBlob(video, maxSide = 640) {
    return new Promise((resolve, reject) => {
        const srcW = video.videoWidth || 640;
        const srcH = video.videoHeight || 480;
        const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
        const w = Math.max(1, Math.round(srcW * scale));
        const h = Math.max(1, Math.round(srcH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Gagal menangkap gambar kamera.'))),
            'image/jpeg',
            0.84
        );
    });
}

function computeClientFrameBrightness(video) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 48, 36);
        const data = ctx.getImageData(0, 0, 48, 36).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        return sum / (48 * 36);
    } catch {
        return 128;
    }
}

export default function FaceScan({
    hasPreviousScan,
    lastMatchedCount,
    totalCatalogPhotos,
    insightFaceReady,
}) {
    const [modelsReady, setModelsReady] = useState(Boolean(insightFaceReady));
    const [modelError, setModelError] = useState(null);

    const [activeAngle, setActiveAngle] = useState('front');
    const [capturedAngles, setCapturedAngles] = useState({
        front: null,
        left: null,
        right: null,
    });

    const [cameraActive, setCameraActive] = useState(false);
    const [cameraStarting, setCameraStarting] = useState(false);
    const [isMirrored, setIsMirrored] = useState(true);
    const [searching, setSearching] = useState(false);
    const [scanError, setScanError] = useState(null);

    // Indikator warna real-time: 'red' | 'yellow' | 'green'
    const [detectionColor, setDetectionColor] = useState('red');
    const [detectionMessage, setDetectionMessage] = useState('Posisikan wajah di dalam lingkaran');
    const [greenStreak, setGreenStreak] = useState(0);

    // Pop-up sukses dengan ikon centang (✓)
    const [successPopup, setSuccessPopup] = useState(null);

    // Alternatif unggah foto
    const [analyzingUpload, setAnalyzingUpload] = useState(false);
    const [snapshotUrl, setSnapshotUrl] = useState(null);
    const [detectedFaces, setDetectedFaces] = useState([]);
    const [selectedFaceIndex, setSelectedFaceIndex] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const cameraRequestRef = useRef(0);
    const fileInputRef = useRef(null);
    const faceApiModuleRef = useRef(null);
    const autoLoopActiveRef = useRef(false);
    const loopTimerRef = useRef(null);
    const greenStreakRef = useRef(0);
    const capturedAnglesRef = useRef(capturedAngles);
    const activeAngleRef = useRef(activeAngle);
    const isMirroredRef = useRef(isMirrored);

    useEffect(() => {
        capturedAnglesRef.current = capturedAngles;
    }, [capturedAngles]);

    useEffect(() => {
        activeAngleRef.current = activeAngle;
    }, [activeAngle]);

    useEffect(() => {
        isMirroredRef.current = isMirrored;
    }, [isMirrored]);

    // Lazy-load faceApiService hanya jika server AI sedang offline (hemat 1,3 MB JS di HP)
    const getClientFaceApi = useCallback(async () => {
        if (!faceApiModuleRef.current) {
            faceApiModuleRef.current = await import('@/Services/faceApiService');
        }
        return faceApiModuleRef.current;
    }, []);

    useEffect(() => {
        if (!insightFaceReady) {
            getClientFaceApi()
                .then((mod) => mod.loadFaceModels())
                .then(() => setModelsReady(true))
                .catch(() => {
                    setModelError('Gagal menyiapkan pemindai wajah. Silakan muat ulang halaman.');
                });
        }

        return () => stopCamera();
    }, [insightFaceReady, getClientFaceApi]);

    const currentStepMeta = ANGLE_STEPS.find((s) => s.key === activeAngle) || ANGLE_STEPS[0];
    const completedCount = Object.values(capturedAngles).filter(Boolean).length;
    const allAnglesComplete = Boolean(capturedAngles.front && capturedAngles.left && capturedAngles.right);

    const isAngleUnlocked = useCallback(
        (angleKey, map = capturedAngles) => {
            if (angleKey === 'front') return true;
            if (angleKey === 'left') return Boolean(map.front);
            if (angleKey === 'right') return Boolean(map.front && map.left);
            return false;
        },
        [capturedAngles]
    );

    const stopCamera = useCallback(() => {
        cameraRequestRef.current += 1;
        autoLoopActiveRef.current = false;
        if (loopTimerRef.current) {
            clearTimeout(loopTimerRef.current);
            loopTimerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setCameraStarting(false);
        setGreenStreak(0);
        greenStreakRef.current = 0;
    }, []);

    useEffect(() => {
        let disposed = false;
        let permission;
        const deniedMessage = cameraErrorMessage({ name: 'NotAllowedError' });
        const updatePermission = () => {
            if (disposed) return;
            if (permission.state === 'denied') setScanError(deniedMessage);
            else setScanError((previous) => previous === deniedMessage ? null : previous);
        };

        navigator.permissions?.query({ name: 'camera' }).then((status) => {
            if (disposed) return;
            permission = status;
            updatePermission();
            permission.addEventListener('change', updatePermission);
        }).catch(() => {});

        return () => {
            disposed = true;
            permission?.removeEventListener('change', updatePermission);
        };
    }, []);

    const validateConsistency = useCallback((chosenFace, targetAngleKey) => {
        const existingMap = capturedAnglesRef.current;
        const isArcFace = chosenFace.face_embedding.length >= 256;

        for (const [angleKey, existing] of Object.entries(existingMap)) {
            if (!existing || angleKey === targetAngleKey) continue;
            if (existing.face_embedding.length !== chosenFace.face_embedding.length) {
                return { ok: false, reason: 'Mohon ulangi pemindaian dari awal.' };
            }
            if (isArcFace) {
                if (cosineSimilarity(chosenFace.face_embedding, existing.face_embedding) < 0.25) {
                    return {
                        ok: false,
                        reason: 'Wajah berbeda dengan tahap sebelumnya. Pastikan wajah Anda sendiri.',
                    };
                }
            } else {
                if (euclideanDistance(chosenFace.face_embedding, existing.face_embedding) > 0.42) {
                    return {
                        ok: false,
                        reason: 'Wajah berbeda dengan tahap sebelumnya. Pastikan wajah Anda sendiri.',
                    };
                }
            }
        }
        return { ok: true };
    }, []);

    const evaluateLiveFrame = useCallback(
        (faces, targetAngleKey, fallbackBrightness = 128) => {
            const stepMeta = ANGLE_STEPS.find((s) => s.key === targetAngleKey) || ANGLE_STEPS[0];

            if (!faces || faces.length === 0) {
                return {
                    color: 'red',
                    message: 'Wajah belum terlihat. Posisikan di dalam lingkaran.',
                    face: null,
                };
            }

            if (faces.length > 1) {
                return {
                    color: 'yellow',
                    message: 'Pastikan hanya wajah Anda sendiri di depan kamera.',
                    face: faces[0],
                };
            }

            const face = faces[0];
            const box = face.bounding_box || {};
            const bw = box.width || 0;
            const cx = (box.x || 0) + bw / 2;
            const cy = (box.y || 0) + (box.height || 0) / 2;
            const brightness = face.brightness ?? fallbackBrightness;
            const sharpness = face.sharpness ?? 80;
            const conf = face.confidence_score ?? 0.9;

            if (bw < 0.09 || conf < 0.50 || brightness < 32) {
                return {
                    color: 'red',
                    message:
                        brightness < 32
                            ? 'Ruangan terlalu gelap. Mohon tambah cahaya.'
                            : 'Wajah kurang jelas. Mohon dekatkan ke lingkaran.',
                    face,
                };
            }

            if (cx < 0.20 || cx > 0.80 || cy < 0.15 || cy > 0.85) {
                return {
                    color: 'yellow',
                    message: 'Geser wajah tepat ke tengah lingkaran.',
                    face,
                };
            }

            if (bw < 0.13) {
                return {
                    color: 'yellow',
                    message: 'Dekatkan sedikit wajah Anda ke kamera.',
                    face,
                };
            }

            if (brightness < 48 || brightness > 235) {
                return {
                    color: 'yellow',
                    message:
                        brightness < 48
                            ? 'Cahaya agak redup. Cari tempat sedikit lebih terang.'
                            : 'Cahaya terlalu silau. Hindari lampu di belakang/depan.',
                    face,
                };
            }

            if (sharpness < 18) {
                return {
                    color: 'yellow',
                    message: 'Tahan wajah sejenak agar gambar tidak buram.',
                    face,
                };
            }

            if (face.pose !== stepMeta.targetPose) {
                let hint = stepMeta.instruction;
                if (targetAngleKey === 'front') {
                    hint = 'Hadapkan wajah lurus ke depan kamera.';
                } else if (targetAngleKey === 'left') {
                    hint =
                        face.pose === 'side_right'
                            ? 'Arah terbalik. Toleh ke kiri atau tekan Balik Cermin.'
                            : 'Tolehkan wajah sedikit ke kiri.';
                } else if (targetAngleKey === 'right') {
                    hint =
                        face.pose === 'side_left'
                            ? 'Arah terbalik. Toleh ke kanan atau tekan Balik Cermin.'
                            : 'Tolehkan wajah sedikit ke kanan.';
                }
                return {
                    color: 'yellow',
                    message: hint,
                    face,
                };
            }

            const consistency = validateConsistency(face, targetAngleKey);
            if (!consistency.ok) {
                return {
                    color: 'yellow',
                    message: consistency.reason,
                    face,
                };
            }

            return {
                color: 'green',
                message: 'Posisi sudah pas! Tahan sebentar...',
                face,
            };
        },
        [validateConsistency]
    );

    const finalizeAngleCapture = useCallback(
        (chosenFace, angleKey, fallbackThumb = null) => {
            const stepMeta = ANGLE_STEPS.find((s) => s.key === angleKey) || ANGLE_STEPS[0];

            const nextCaptured = {
                ...capturedAnglesRef.current,
                [angleKey]: {
                    face_embedding: chosenFace.face_embedding,
                    bounding_box: chosenFace.bounding_box,
                    pose_label: chosenFace.pose_label,
                    confidence_score: chosenFace.confidence_score,
                    thumb_url: chosenFace.thumb_url || fallbackThumb,
                },
            };

            setCapturedAngles(nextCaptured);
            capturedAnglesRef.current = nextCaptured;
            stopCamera();
            setSnapshotUrl(null);
            setDetectedFaces([]);
            setSelectedFaceIndex(null);
            setScanError(null);

            const nextAngleStep = ANGLE_STEPS.find((s) => !nextCaptured[s.key]) || null;

            if (nextAngleStep) {
                setActiveAngle(nextAngleStep.key);
                activeAngleRef.current = nextAngleStep.key;
            }

            setSuccessPopup({
                completedStep: stepMeta,
                thumbUrl: chosenFace.thumb_url || fallbackThumb,
                nextStep: nextAngleStep,
                allDone: !nextAngleStep,
            });
        },
        [stopCamera]
    );

    const runAutoScanTick = useCallback(async () => {
        if (!autoLoopActiveRef.current) return;
        const requestId = cameraRequestRef.current;
        const video = videoRef.current;

        if (!video || video.readyState < 2 || video.videoWidth === 0) {
            loopTimerRef.current = setTimeout(runAutoScanTick, 250);
            return;
        }

        const currentTargetKey = activeAngleRef.current;
        const mirrored = isMirroredRef.current;

        try {
            let faces = [];
            let fallbackBrightness = 128;

            try {
                const blob = await videoFrameToBlob(video, 640);
                const formData = new FormData();
                formData.append('image', blob, 'live.jpg');
                formData.append('mirror_horizontal', mirrored ? '1' : '0');
                formData.append('include_snapshot', '0');
                const res = await axios.post('/scan-foto/detect', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                faces = res.data?.faces || [];
            } catch {
                fallbackBrightness = computeClientFrameBrightness(video);
                const mod = await getClientFaceApi();
                const res = await mod.detectFacesFromSource(video, { mirrorHorizontal: mirrored });
                faces = res.faces || [];
            }

            if (!autoLoopActiveRef.current || requestId !== cameraRequestRef.current) return;

            const evaluation = evaluateLiveFrame(faces, currentTargetKey, fallbackBrightness);
            setDetectionColor(evaluation.color);
            setDetectionMessage(evaluation.message);

            if (evaluation.color === 'green' && evaluation.face) {
                const nextStreak = greenStreakRef.current + 1;
                greenStreakRef.current = nextStreak;
                setGreenStreak(nextStreak);

                if (nextStreak >= 2) {
                    finalizeAngleCapture(evaluation.face, currentTargetKey);
                    return;
                }
            } else {
                greenStreakRef.current = 0;
                setGreenStreak(0);
            }
        } catch {
            // Abaikan error frame sementara, lanjut tick berikutnya
        }

        if (autoLoopActiveRef.current && requestId === cameraRequestRef.current) {
            loopTimerRef.current = setTimeout(runAutoScanTick, 420);
        }
    }, [evaluateLiveFrame, finalizeAngleCapture, getClientFaceApi, insightFaceReady]);

    useEffect(() => {
        if (!cameraActive) return;
        const video = videoRef.current;
        const stream = streamRef.current;
        if (!video || !stream) return;
        let disposed = false;

        video.srcObject = stream;
        video.play().then(() => {
            if (disposed || streamRef.current !== stream) return;
            autoLoopActiveRef.current = true;
            runAutoScanTick();
        }).catch((error) => {
            if (disposed) return;
            stopCamera();
            setScanError(cameraErrorMessage(error));
        });

        return () => {
            disposed = true;
            autoLoopActiveRef.current = false;
            if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
            video.pause();
            video.srcObject = null;
        };
    }, [cameraActive, runAutoScanTick, stopCamera]);

    const startAutoCamera = useCallback(
        async (targetAngleKey = activeAngleRef.current) => {
            setSuccessPopup(null);
            setActiveAngle(targetAngleKey);
            activeAngleRef.current = targetAngleKey;

            setScanError(null);
            setSnapshotUrl(null);
            setDetectedFaces([]);
            setSelectedFaceIndex(null);
            setDetectionColor('red');
            setDetectionMessage('Posisikan wajah di dalam lingkaran');
            greenStreakRef.current = 0;
            setGreenStreak(0);
            stopCamera();
            const requestId = cameraRequestRef.current;
            setCameraStarting(true);

            try {
                const stream = await requestScanCamera();
                if (cameraRequestRef.current !== requestId) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                setCameraActive(true);
            } catch (error) {
                if (cameraRequestRef.current === requestId) setScanError(cameraErrorMessage(error));
            } finally {
                if (cameraRequestRef.current === requestId) setCameraStarting(false);
            }
        },
        [stopCamera]
    );

    const toggleMirrorCamera = () => {
        setIsMirrored((prev) => !prev);
        greenStreakRef.current = 0;
        setGreenStreak(0);
    };

    const handleUploadSelfie = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        stopCamera();
        setSuccessPopup(null);
        setAnalyzingUpload(true);
        setScanError(null);

        try {
            let result;
            try {
                const formData = new FormData();
                formData.append('image', file, file.name || 'upload.jpg');
                formData.append('mirror_horizontal', '0');
                formData.append('include_snapshot', '1');
                const res = await axios.post('/scan-foto/detect', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                result = res.data;
            } catch {
                const mod = await getClientFaceApi();
                const url = URL.createObjectURL(file);
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
                result = await mod.detectFacesFromSource(img, { mirrorHorizontal: false });
                URL.revokeObjectURL(url);
            }

            setSnapshotUrl(result.snapshotDataUrl);
            setDetectedFaces(result.faces || []);
            if (!result.faces || result.faces.length === 0) {
                setSelectedFaceIndex(null);
                setScanError('Wajah belum terbaca pada foto ini. Coba foto lain atau gunakan Scan Kamera.');
            } else if (result.faces.length === 1) {
                setSelectedFaceIndex(0);
            } else {
                setSelectedFaceIndex(null);
            }
        } catch {
            setScanError('Gagal membaca foto. Silakan coba lagi.');
        } finally {
            setAnalyzingUpload(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmUploadedFace = () => {
        if (selectedFaceIndex === null || !detectedFaces[selectedFaceIndex]) return;
        const chosenFace = detectedFaces[selectedFaceIndex];

        if (activeAngle === 'front' && chosenFace.pose !== 'frontal') {
            setScanError('Untuk Wajah Depan, gunakan foto yang menghadap lurus ke kamera.');
            return;
        }

        if ((chosenFace.bounding_box?.width || 0) < 0.08) {
            setScanError('Wajah terlalu kecil pada foto ini. Pilih foto yang wajahnya lebih dekat.');
            return;
        }

        const consistency = validateConsistency(chosenFace, activeAngle);
        if (!consistency.ok) {
            setScanError(consistency.reason);
            return;
        }

        finalizeAngleCapture(chosenFace, activeAngle, snapshotUrl);
    };

    const handleSearchPhotos = async () => {
        const current = capturedAnglesRef.current;
        if (!current.front || !current.left || !current.right) return;

        setSuccessPopup(null);
        setSearching(true);
        setScanError(null);

        try {
            const res = await axios.post('/scan-foto/search', {
                face_embeddings: {
                    front: current.front.face_embedding,
                    left: current.left.face_embedding,
                    right: current.right.face_embedding,
                },
                selected_boxes: {
                    front: current.front.bounding_box,
                    left: current.left.bounding_box,
                    right: current.right.bounding_box,
                },
            });
            router.visit(res.data.redirectUrl || '/scan-foto/hasil');
        } catch (err) {
            setScanError(
                err.response?.data?.message || 'Gagal mencari foto. Silakan coba lagi.'
            );
            setSearching(false);
        }
    };

    const indicator = {
        red: {
            stroke: '#F43F5E',
            track: 'rgba(244, 63, 94, 0.25)',
            pill: 'bg-rose-950/90 border-rose-500/60 text-rose-200',
            dot: 'bg-rose-500',
            text: 'Wajah Belum Terlihat',
        },
        yellow: {
            stroke: '#FBBF24',
            track: 'rgba(251, 191, 36, 0.25)',
            pill: 'bg-amber-950/90 border-amber-400/60 text-amber-200',
            dot: 'bg-amber-400',
            text: 'Sesuaikan Posisi',
        },
        green: {
            stroke: '#34D399',
            track: 'rgba(52, 211, 153, 0.30)',
            pill: 'bg-emerald-950/90 border-emerald-400/70 text-emerald-200',
            dot: 'bg-emerald-400',
            text: 'Wajah Jelas • Siap',
        },
    }[detectionColor];

    return (
        <ScanCustomerLayout title="Scan Wajah">
            <Head title="Scan Wajah" />

            <div className="max-w-3xl mx-auto space-y-5">
                {/* Cinematic Hero Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0D1A2F] via-[#0B1426] to-[#0E1025] border border-sky-400/25 shadow-2xl shadow-sky-950/30 space-y-3"
                >
                    <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                    <div
                        aria-hidden="true"
                        className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 70%)',
                        }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="font-heading text-lg sm:text-xl font-black text-white">
                            Scan 3 Arah Wajah
                        </h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-xs font-bold text-cyan-300">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-hud-pulse" />
                            <span>{completedCount} / 3 selesai</span>
                        </div>
                    </div>

                    <p className="relative z-10 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Scan wajah depan, kiri, dan kanan untuk menemukan foto Anda ({totalCatalogPhotos} foto tersedia).
                    </p>

                    {/* Animated Progress Rail */}
                    <div className="relative z-10 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((completedCount / 3) * 100)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400"
                        />
                    </div>

                    {hasPreviousScan && (
                        <div className="relative z-10 pt-1">
                            <Link
                                href="/scan-foto/hasil"
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-xs font-bold text-sky-300 transition-all"
                            >
                                <span>Buka hasil scan sebelumnya ({lastMatchedCount} foto)</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* 3 Kartu Arah Scan (Berurutan: 1. Depan -> 2. Kiri -> 3. Kanan) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                    {ANGLE_STEPS.map((step, idx) => {
                        const data = capturedAngles[step.key];
                        const isActive = activeAngle === step.key;
                        const isLocked = !isAngleUnlocked(step.key);
                        return (
                            <motion.button
                                key={step.key}
                                type="button"
                                disabled={isLocked}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                whileHover={!isLocked ? { y: -2 } : undefined}
                                whileTap={!isLocked ? { scale: 0.98 } : undefined}
                                onClick={() => {
                                    if (isLocked) return;
                                    stopCamera();
                                    setActiveAngle(step.key);
                                    activeAngleRef.current = step.key;
                                    setSnapshotUrl(null);
                                    setDetectedFaces([]);
                                    setSelectedFaceIndex(null);
                                    setScanError(null);
                                }}
                                title={
                                    isLocked
                                        ? step.key === 'left'
                                            ? 'Terkunci: Selesaikan scan 1. Depan terlebih dahulu'
                                            : 'Terkunci: Selesaikan scan 1. Depan & 2. Kiri terlebih dahulu'
                                        : step.title
                                }
                                className={`relative p-3 sm:p-4 rounded-2xl border text-center sm:text-left transition-all flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 backdrop-blur-xl ${
                                    isLocked
                                        ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                                        : isActive
                                          ? 'bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border-cyan-400/60 shadow-lg shadow-sky-500/15 cursor-pointer'
                                          : data
                                            ? 'bg-emerald-500/12 border-emerald-400/45 shadow-md shadow-emerald-500/10 cursor-pointer'
                                            : 'bg-white/[0.04] border-white/10 hover:border-white/20 cursor-pointer'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#070C17] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {data?.thumb_url ? (
                                        <>
                                            <img
                                                src={data.thumb_url}
                                                alt={step.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-sm">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </span>
                                        </>
                                    ) : isLocked ? (
                                        <Lock className="w-4 h-4 text-slate-500" />
                                    ) : (
                                        <ScanFace
                                            className={`w-5 h-5 ${
                                                isActive ? 'text-cyan-300 animate-pulse' : 'text-slate-400'
                                            }`}
                                        />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-xs font-bold text-white truncate">
                                        {step.shortTitle}
                                    </span>
                                    <span
                                        className={`block text-[11px] font-semibold mt-0.5 ${
                                            data
                                                ? 'text-emerald-400'
                                                : isLocked
                                                  ? 'text-slate-500'
                                                  : isActive
                                                    ? 'text-cyan-300'
                                                    : 'text-slate-400'
                                        }`}
                                    >
                                        {data ? '✓ Selesai' : isLocked ? 'Terkunci' : isActive ? '● Siap Scan' : 'Terbuka'}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Tombol Cari Foto saat ke-3 arah selesai */}
                <AnimatePresence>
                    {allAnglesComplete && !snapshotUrl && !cameraActive && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="relative overflow-hidden bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/15 border border-emerald-400/45 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/30"
                        >
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    3 arah wajah selesai
                                </p>
                                <p className="text-xs text-slate-300">
                                    Klik tombol untuk menampilkan foto Anda.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={handleSearchPhotos}
                                disabled={searching}
                                className="min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 transition-all shrink-0 cursor-pointer disabled:opacity-60"
                            >
                                {searching ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Mencari...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Cari Foto Saya</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!modelsReady && !modelError && (
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex items-center justify-center gap-3 text-sm text-sky-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyiapkan pemindai wajah...</span>
                    </div>
                )}

                {modelError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-200 flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{modelError}</span>
                    </div>
                )}

                {scanError && (
                    <div className="animate-fade-in bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{scanError}</span>
                    </div>
                )}

                {/* Area Scan Sudut Aktif */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="rounded-3xl bg-[#0B1222]/95 border border-white/10 p-5 sm:p-6 space-y-5 shadow-2xl shadow-black/40"
                >
                    <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                        <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                Tahap {currentStepMeta.stepNumber} dari 3
                            </span>
                            <h3 className="font-heading text-lg font-black text-white mt-0.5">
                                {currentStepMeta.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">{currentStepMeta.instruction}</p>
                        </div>
                    </div>

                    {!cameraActive && !snapshotUrl && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <motion.button
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                disabled={!modelsReady || analyzingUpload || cameraStarting}
                                onClick={() => startAutoCamera(activeAngle)}
                                className="relative overflow-hidden min-h-28 flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 text-left shadow-xl shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <div className="w-13 h-13 rounded-2xl bg-slate-950/15 flex items-center justify-center shrink-0">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-black leading-tight">
                                        {cameraStarting ? 'Membuka Kamera...' : 'Scan Kamera'}
                                    </span>
                                    <span className="block text-xs text-slate-950/80 font-medium mt-0.5">
                                        Deteksi otomatis ({currentStepMeta.title})
                                    </span>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                disabled={!modelsReady || analyzingUpload || cameraStarting}
                                onClick={() => fileInputRef.current?.click()}
                                className="min-h-28 flex items-center gap-4 p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/12 hover:border-cyan-400/40 text-left transition-all cursor-pointer disabled:opacity-50"
                            >
                                <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center border border-cyan-400/25 shrink-0">
                                    {analyzingUpload ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-white leading-tight">
                                        {analyzingUpload ? 'Membaca Foto...' : 'Upload Foto'}
                                    </span>
                                    <span className="block text-xs text-slate-400 mt-0.5">
                                        Pilih foto dari galeri
                                    </span>
                                </div>
                            </motion.button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUploadSelfie}
                            />
                        </div>
                    )}

                    {/* Kamera Auto-Capture + Ring Memutar + Indikator Merah/Kuning/Hijau */}
                    {cameraActive && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video max-h-[62vh] mx-auto flex items-center justify-center border border-cyan-400/30 shadow-2xl shadow-cyan-950/40">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-transform duration-200 ${
                                        isMirrored ? '-scale-x-100' : 'scale-x-100'
                                    }`}
                                />

                                {/* HUD Corner Reticles */}
                                <div aria-hidden="true" className="absolute inset-4 pointer-events-none">
                                    <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-300/70 rounded-tl-lg" />
                                    <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-300/70 rounded-tr-lg" />
                                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-300/70 rounded-bl-lg" />
                                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-300/70 rounded-br-lg" />
                                </div>

                                {/* Area Lingkaran Scan + Animasi Ring Memutar */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center">
                                        <svg
                                            viewBox="0 0 220 220"
                                            className="w-full h-full animate-spin will-change-transform"
                                            style={{ animationDuration: '2s' }}
                                        >
                                            <circle
                                                cx="110"
                                                cy="110"
                                                r="102"
                                                fill="none"
                                                stroke={indicator.track}
                                                strokeWidth="5"
                                            />
                                            <circle
                                                cx="110"
                                                cy="110"
                                                r="102"
                                                fill="none"
                                                stroke={indicator.stroke}
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                                strokeDasharray="160 480"
                                            />
                                        </svg>

                                        {detectionColor === 'green' && (
                                            <div className="absolute -bottom-3 px-3.5 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/40">
                                                Menyimpan ({Math.min(2, greenStreak)}/2)...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pill Indikator Warna di Atas */}
                                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
                                    <div
                                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold transition-colors ${indicator.pill}`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full ${indicator.dot} animate-pulse`} />
                                        <span>{indicator.text}</span>
                                    </div>
                                </div>

                                {/* Panduan Singkat di Bawah */}
                                <div className="absolute bottom-3.5 left-3.5 right-3.5 px-4 py-3 rounded-2xl bg-black/75 backdrop-blur-md text-center border border-white/15 pointer-events-none">
                                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                                        {currentStepMeta.title}
                                    </p>
                                    <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                                        {detectionMessage}
                                    </p>
                                </div>
                            </div>

                            {/* Keterangan 3 Warna & Tombol Kontrol */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap justify-center">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        Merah: Belum jelas
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        Kuning: Sesuaikan
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                        Hijau: Siap
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={toggleMirrorCamera}
                                        className={`flex-1 sm:flex-none min-h-11 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors active:scale-[0.98] cursor-pointer ${
                                            isMirrored
                                                ? 'bg-sky-500/15 border-sky-400/40 text-sky-300'
                                                : 'bg-white/[0.06] border-white/12 text-slate-200'
                                        }`}
                                    >
                                        <FlipHorizontal2 className="w-4 h-4" />
                                        <span>Balik Cermin</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="min-h-11 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pemilihan Wajah untuk Mode Upload Foto */}
                    {snapshotUrl && (
                        <div className="space-y-3.5 animate-fade-in">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <p className="text-xs font-medium text-slate-300">
                                    {detectedFaces.length > 1
                                        ? 'Sentuh kotak wajah Anda pada foto di bawah:'
                                        : detectedFaces.length === 1
                                          ? 'Wajah ditemukan. Klik tombol simpan di bawah.'
                                          : 'Wajah tidak ditemukan.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSnapshotUrl(null);
                                        setDetectedFaces([]);
                                        setSelectedFaceIndex(null);
                                        setScanError(null);
                                    }}
                                    className="min-h-9 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs text-slate-200 cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Ganti Foto</span>
                                </button>
                            </div>

                            <div className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-black border border-white/15">
                                <img
                                    src={snapshotUrl}
                                    alt="Pratinjau Wajah"
                                    className="w-full h-auto block select-none"
                                />
                                {detectedFaces.map((face, idx) => {
                                    const isSelected = selectedFaceIndex === idx;
                                    const b = face.bounding_box;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedFaceIndex(idx)}
                                            style={{
                                                left: `${b.x * 100}%`,
                                                top: `${b.y * 100}%`,
                                                width: `${b.width * 100}%`,
                                                height: `${b.height * 100}%`,
                                            }}
                                            className={`absolute rounded-xl cursor-pointer transition-colors ${
                                                isSelected
                                                    ? 'border-3 border-emerald-400 bg-emerald-400/15 z-10'
                                                    : 'border-2 border-amber-400 bg-amber-400/10'
                                            }`}
                                        >
                                            <span
                                                className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                                                    isSelected
                                                        ? 'bg-emerald-400 text-slate-950'
                                                        : 'bg-amber-400 text-slate-950'
                                                }`}
                                            >
                                                {isSelected ? '✓ Dipilih' : `Wajah #${idx + 1}`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {detectedFaces.length > 0 && (
                                <button
                                    type="button"
                                    disabled={selectedFaceIndex === null}
                                    onClick={confirmUploadedFace}
                                    className="w-full min-h-12 py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-sky-500/25"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                        {selectedFaceIndex === null
                                            ? 'Pilih Kotak Wajah Dahulu'
                                            : `Simpan ${currentStepMeta.title}`}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Pop-up Konfirmasi Berhasil dengan Animasi Spring */}
            <AnimatePresence>
                {successPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                            className="relative w-full max-w-xs sm:max-w-sm bg-[#0C1425] border border-emerald-400/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-emerald-950/50"
                        >
                            <button
                                type="button"
                                onClick={() => setSuccessPopup(null)}
                                className="absolute top-3.5 right-3.5 min-w-9 min-h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                                aria-label="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.08 }}
                                className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                            >
                                <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
                            </motion.div>

                            <div className="space-y-1">
                                <h3 className="font-heading text-lg font-black text-white">
                                    {successPopup.allDone
                                        ? 'Scan Wajah Selesai!'
                                        : `${successPopup.completedStep.title} Berhasil!`}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300">
                                    {successPopup.allDone
                                        ? 'Ketiga arah wajah sudah tersimpan. Silakan cari foto Anda sekarang.'
                                        : 'Wajah berhasil dipindai. Lanjutkan ke arah berikutnya.'}
                                </p>
                            </div>

                            {successPopup.thumbUrl && (
                                <div className="flex justify-center">
                                    <img
                                        src={successPopup.thumbUrl}
                                        alt="Hasil Scan"
                                        className="w-18 h-18 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-lg"
                                    />
                                </div>
                            )}

                            <div className="pt-1 space-y-2">
                                {successPopup.allDone ? (
                                    <button
                                        type="button"
                                        onClick={handleSearchPhotos}
                                        disabled={searching}
                                        className="w-full min-h-12 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>Cari Foto Saya</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => startAutoCamera(successPopup.nextStep.key)}
                                        className="w-full min-h-12 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/25"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>Lanjut: {successPopup.nextStep.title}</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setSuccessPopup(null)}
                                    className="w-full min-h-10 py-2 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ScanCustomerLayout>
    );
}
