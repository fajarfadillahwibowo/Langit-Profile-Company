import test from 'node:test';
import assert from 'node:assert/strict';
import { uploadRawPhotosBatch, formatUploadBytes } from './rawPhotoUploader.mjs';

test('formatUploadBytes formats properly', () => {
    assert.equal(formatUploadBytes(0), '0 KB');
    assert.equal(formatUploadBytes(1024), '1 KB');
    assert.equal(formatUploadBytes(1048576), '1.0 MB');
    assert.equal(formatUploadBytes(1073741824), '1.00 GB');
});

test('uploadRawPhotosBatch divides 25 files into batches of 10 and uploads concurrently with settings', async () => {
    const fakeFiles = Array.from({ length: 25 }, (_, i) => ({
        name: `DSC_${i + 1}.JPG`,
        size: 500000,
        type: 'image/jpeg',
    }));

    const receivedCalls = [];
    const progressReports = [];

    const fakePost = async (url, formData, config) => {
        const photos = formData.getAll('photos[]');
        receivedCalls.push({
            url,
            count: photos.length,
            hasPrice: formData.has('raw_price_per_photo'),
            price: formData.get('raw_price_per_photo'),
        });
        return { data: { success: true } };
    };

    const result = await uploadRawPhotosBatch({
        deliveryId: 99,
        files: fakeFiles,
        settings: {
            raw_price_per_photo: 20000,
            raw_price_description: 'Rp 20.000 / foto',
            raw_discount_5_percent: 15,
            raw_discount_10_percent: 25,
        },
        batchSize: 10,
        concurrency: 2,
        postFn: fakePost,
        onProgress: (p) => progressReports.push({ ...p }),
    });

    assert.equal(result.success, true);
    assert.equal(result.complete, true);
    assert.equal(result.uploadedCount, 25);
    assert.equal(result.failedCount, 0);

    // 25 files in batchSize 10 => 3 batches (10, 10, 5)
    assert.equal(receivedCalls.length, 3);
    const totalFilesSent = receivedCalls.reduce((s, c) => s + c.count, 0);
    assert.equal(totalFilesSent, 25);

    // First batch carries price settings
    assert.ok(receivedCalls.some(c => c.hasPrice && c.price === '20000'));

    // Final progress report is 100%
    const lastProgress = progressReports[progressReports.length - 1];
    assert.equal(lastProgress.percent, 100);
    assert.equal(lastProgress.completedFiles, 25);
});

test('uploadRawPhotosBatch handles retries on network blips and continues remaining batches', async () => {
    const fakeFiles = Array.from({ length: 20 }, (_, i) => ({
        name: `IMG_${i + 1}.JPG`,
        size: 200000,
        type: 'image/jpeg',
    }));

    let attempts = 0;
    const fakePost = async (url, formData) => {
        attempts++;
        if (attempts === 1) {
            throw new Error('Network timeout simulation');
        }
        return { data: { success: true } };
    };

    const result = await uploadRawPhotosBatch({
        deliveryId: 10,
        files: fakeFiles,
        batchSize: 10,
        concurrency: 1,
        postFn: fakePost,
        sleep: () => Promise.resolve(),
    });

    assert.equal(result.success, true);
    assert.equal(result.complete, true);
    assert.equal(result.uploadedCount, 20);
    assert.ok(attempts >= 3); // Retried first batch, then succeeded second batch
});
