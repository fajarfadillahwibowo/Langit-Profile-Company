export const CHUNK_BYTES = 8 * 1024 * 1024;
const digest = async blob => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())), byte => byte.toString(16).padStart(2, '0')).join('');

// Bounded concurrency (default 2) avoids browser pipeline stalls on large batch photo sets.
export async function uploadFiles({ deliveryId, jobs, send, signal, concurrency = 2, onProgress = () => {}, hash = digest, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
    const total = jobs.reduce((sum, job) => sum + job.file.size, 0);
    let accepted = jobs.filter(job => job.done).length;
    let bytes = jobs.filter(job => job.done).reduce((sum, job) => sum + job.file.size, 0);
    let failed = 0;
    const report = () => onProgress({ accepted, failed, total: jobs.length, bytes, totalBytes: total, percent: accepted === jobs.length ? 100 : Math.min(99, Math.floor(bytes / Math.max(1, total) * 100)) });
    const check = () => { if (signal?.aborted) throw new DOMException('Dibatalkan', 'AbortError'); };
    const request = async (url, body) => {
        for (let attempt = 0; ; attempt++) {
            check();
            try { return await send(url, body, signal); }
            catch (error) {
                check();
                const status = error.response?.status;
                if (attempt >= 3 || (status && status < 500 && ![408, 429].includes(status))) throw error;
                await sleep(500 * 2 ** attempt);
            }
        }
    };
    report();
    let authFailed = false;
    let cursor = 0;
    async function worker() {
        while (cursor < jobs.length) {
            if (signal?.aborted || authFailed) break;
            const idx = cursor++;
            const job = jobs[idx];
            if (job.done) continue;
            let currentBytes = 0;
            try {
                job.error = '';
                const base = `/admin/client-deliveries/${deliveryId}/uploads/${job.id}`;
                const chunks = Math.ceil(job.file.size / CHUNK_BYTES);
                const status = await request(base, { name: job.name, size: job.file.size, chunks });
                if (!status.complete) {
                    const received = new Set(status.received);
                    for (let index = 0; index < chunks; index++) {
                        check();
                        if (authFailed) break;
                        const blob = job.file.slice(index * CHUNK_BYTES, Math.min((index + 1) * CHUNK_BYTES, job.file.size));
                        if (!received.has(index)) {
                            const body = new FormData();
                            body.append('index', String(index));
                            body.append('sha256', await hash(blob));
                            body.append('chunk', blob, 'chunk.bin');
                            const ack = await request(`${base}/chunks`, body);
                            if (!ack.accepted) throw new Error('Server belum menerima potongan.');
                        }
                        bytes += blob.size; currentBytes += blob.size; report();
                    }
                }
                if (authFailed || signal?.aborted) break;
                const ack = status.complete ? status : await request(`${base}/complete`, {});
                if (!ack.complete || !ack.photo_id || !Number.isInteger(ack.total_photos)) throw new Error('Konfirmasi server tidak lengkap.');
                bytes += job.file.size - currentBytes;
                job.done = true; job.photoId = ack.photo_id; job.totalPhotos = ack.total_photos;
                accepted++; report();
            } catch (error) {
                bytes -= currentBytes;
                const status = error.response?.status;
                job.error = error.response?.data?.message || (status === 403 ? 'Akses ditolak (403 Forbidden)' : status === 401 ? 'Sesi berakhir (401 Unauthorized)' : error.message || 'Upload gagal');
                failed++; report();
                if (status === 401 || status === 403) {
                    authFailed = true;
                    break;
                }
                if (signal?.aborted) break;
            }
        }
    }
    const poolSize = Math.max(1, Math.min(concurrency, jobs.length));
    await Promise.all(Array.from({ length: poolSize }, () => worker()));
    return { accepted, failed, cancelled: Boolean(signal?.aborted), complete: accepted === jobs.length };
}
