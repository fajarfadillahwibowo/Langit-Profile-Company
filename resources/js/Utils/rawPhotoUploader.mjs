/**
 * In-browser Image Compressor for High-Volume Raw Photo Proofing
 * Resizes large camera files (10MB-30MB, 6000x4000) down to ~150-300KB Full HD (1920px)
 * maintaining full color fidelity and sharpness for proofing.
 */
export async function compressImageFile(file, { maxDimension = 1920, quality = 0.82 } = {}) {
    if (!file || typeof file.type !== 'string' || !file.type.startsWith('image/')) {
        return file;
    }

    // Skip if already small
    if (file.size <= 250 * 1024) {
        return file;
    }

    try {
        let bitmap = null;
        if (typeof createImageBitmap === 'function') {
            bitmap = await createImageBitmap(file);
        } else if (typeof Image !== 'undefined' && typeof URL !== 'undefined') {
            bitmap = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = URL.createObjectURL(file);
            });
        }

        if (!bitmap) return file;

        const origW = bitmap.width;
        const origH = bitmap.height;

        let targetW = origW;
        let targetH = origH;

        if (origW > maxDimension || origH > maxDimension) {
            if (origW >= origH) {
                targetW = maxDimension;
                targetH = Math.round((origH / origW) * maxDimension);
            } else {
                targetH = maxDimension;
                targetW = Math.round((origW / origH) * maxDimension);
            }
        }

        let canvas;
        if (typeof OffscreenCanvas !== 'undefined') {
            canvas = new OffscreenCanvas(targetW, targetH);
        } else if (typeof document !== 'undefined') {
            canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
        }

        if (!canvas) return file;

        const ctx = canvas.getContext('2d');
        if (!ctx) return file;

        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        if (bitmap.close) bitmap.close();

        let blob;
        if (canvas.convertToBlob) {
            blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
        } else if (canvas.toBlob) {
            blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', quality);
            });
        }

        if (!blob || blob.size >= file.size) {
            return file;
        }

        return new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: file.lastModified || Date.now(),
        });
    } catch {
        return file;
    }
}

/**
 * Format bytes into human readable string
 */
export function formatUploadBytes(bytes) {
    if (!bytes) return '0 KB';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
}

/**
 * Upload Raw Photos in Streamed Batches (Supports 100, 500, to 1000+ files effortlessly)
 */
export async function uploadRawPhotosBatch({
    deliveryId,
    files = [],
    settings = {},
    batchSize = 10,
    concurrency = 2,
    signal,
    onProgress = () => {},
    postFn,
    sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
}) {
    if (!files.length) {
        return { success: true, uploadedCount: 0, totalPhotos: 0 };
    }

    const totalFiles = files.length;
    let completedFiles = 0;
    let failedFiles = 0;
    let totalBytesSent = 0;
    const errors = [];

    // Slice files into batches of batchSize
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
        batches.push(files.slice(i, i + batchSize));
    }

    const totalBatches = batches.length;
    let batchIndexCursor = 0;

    const report = (phaseText = '') => {
        const percent = totalFiles > 0 ? Math.min(100, Math.round((completedFiles / totalFiles) * 100)) : 0;
        onProgress({
            completedFiles,
            failedFiles,
            totalFiles,
            percent,
            totalBatches,
            currentBatch: Math.min(totalBatches, Math.ceil(completedFiles / batchSize) + 1),
            totalBytesSent,
            formattedBytes: formatUploadBytes(totalBytesSent),
            statusText: phaseText || `${completedFiles}/${totalFiles} foto selesai (${percent}%)`,
        });
    };

    report('Mempersiapkan foto...');

    const runBatchWorker = async () => {
        while (batchIndexCursor < batches.length) {
            if (signal?.aborted) throw new DOMException('Dibatalkan oleh admin', 'AbortError');

            const currentBatchIdx = batchIndexCursor++;
            const rawBatch = batches[currentBatchIdx];
            if (!rawBatch || !rawBatch.length) continue;

            report(`Mengompres & memproses batch ${currentBatchIdx + 1} dari ${totalBatches}...`);

            // 1. In-browser compress batch
            const compressedBatch = [];
            for (const file of rawBatch) {
                if (signal?.aborted) throw new DOMException('Dibatalkan oleh admin', 'AbortError');
                const compressed = await compressImageFile(file);
                compressedBatch.push(compressed);
            }

            // 2. Prepare FormData
            const formData = new FormData();
            let batchBytes = 0;
            compressedBatch.forEach((file) => {
                formData.append('photos[]', file);
                batchBytes += file.size || 0;
            });

            // Include album pricing & discount settings on first batch or if provided
            if (currentBatchIdx === 0) {
                if (settings.raw_price_per_photo !== undefined) {
                    formData.append('raw_price_per_photo', settings.raw_price_per_photo);
                }
                if (settings.raw_price_description) {
                    formData.append('raw_price_description', settings.raw_price_description);
                }
                if (settings.raw_discount_5_percent !== undefined) {
                    formData.append('raw_discount_5_percent', settings.raw_discount_5_percent);
                }
                if (settings.raw_discount_10_percent !== undefined) {
                    formData.append('raw_discount_10_percent', settings.raw_discount_10_percent);
                }
                if (settings.raw_notes) {
                    formData.append('raw_notes', settings.raw_notes);
                }
            }

            // 3. Send with retry
            let success = false;
            let lastErr = null;

            for (let attempt = 0; attempt < 3; attempt++) {
                if (signal?.aborted) throw new DOMException('Dibatalkan oleh admin', 'AbortError');

                try {
                    report(`Mengunggah batch ${currentBatchIdx + 1}/${totalBatches} (${completedFiles}/${totalFiles} foto)...`);
                    const url = `/admin/client-deliveries/${deliveryId}/raw-photos`;
                    
                    if (typeof postFn === 'function') {
                        await postFn(url, formData, { signal, headers: { Accept: 'application/json' } });
                    } else if (typeof window !== 'undefined' && window.axios) {
                        await window.axios.post(url, formData, { signal, headers: { Accept: 'application/json' } });
                    } else {
                        // Fetch fallback
                        const res = await fetch(url, {
                            method: 'POST',
                            body: formData,
                            signal,
                            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                        });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    }

                    success = true;
                    completedFiles += rawBatch.length;
                    totalBytesSent += batchBytes;
                    report();
                    break;
                } catch (err) {
                    lastErr = err;
                    if (signal?.aborted) throw err;
                    if (attempt < 2) {
                        await sleep(600 * (attempt + 1));
                    }
                }
            }

            if (!success) {
                failedFiles += rawBatch.length;
                errors.push(`Batch ${currentBatchIdx + 1} gagal: ${lastErr?.message || 'Error jaringan'}`);
                report(`Batch ${currentBatchIdx + 1} gagal, melanjutkan batch berikutnya...`);
            }
        }
    };

    const poolSize = Math.max(1, Math.min(concurrency, batches.length));
    await Promise.all(Array.from({ length: poolSize }, () => runBatchWorker()));

    const isComplete = completedFiles === totalFiles;
    report(isComplete ? `Semua ${completedFiles} foto berhasil diunggah & dikompresi!` : `${completedFiles} foto berhasil, ${failedFiles} gagal.`);

    return {
        success: completedFiles > 0,
        complete: isComplete,
        uploadedCount: completedFiles,
        failedCount: failedFiles,
        totalPhotos: totalFiles,
        errors,
    };
}
