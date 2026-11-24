import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraErrorMessage, requestScanCamera } from '../resources/js/Utils/scanCamera.mjs';

test('opens the preferred front camera without requesting audio', async () => {
    const stream = { id: 'front-camera' };
    const result = await requestScanCamera({
        secure: true,
        permissions: { query: async () => ({ state: 'granted' }) },
        mediaDevices: {
            getUserMedia: async (constraints) => {
                assert.deepEqual(constraints, {
                    video: { facingMode: { ideal: 'user' }, width: { ideal: 960 }, height: { ideal: 720 } },
                    audio: false,
                });
                return stream;
            },
        },
    });
    assert.equal(result, stream);
});

test('does not request media when camera permission is already denied', async () => {
    let requests = 0;
    await assert.rejects(requestScanCamera({
        secure: true,
        permissions: { query: async () => ({ state: 'denied' }) },
        mediaDevices: { getUserMedia: async () => { requests += 1; } },
    }), { name: 'NotAllowedError' });
    assert.equal(requests, 0);
});

test('falls back to basic video only for unsupported camera constraints', async () => {
    const calls = [];
    const stream = { id: 'basic-camera' };
    const result = await requestScanCamera({
        secure: true,
        mediaDevices: {
            getUserMedia: async (constraints) => {
                calls.push(constraints);
                if (calls.length === 1) throw { name: 'OverconstrainedError' };
                return stream;
            },
        },
    });
    assert.equal(result, stream);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1], { video: true, audio: false });
});

for (const name of ['NotAllowedError', 'NotReadableError', 'NotFoundError', 'AbortError']) {
    test(`does not retry or conceal ${name}`, async () => {
        let requests = 0;
        await assert.rejects(requestScanCamera({
            secure: true,
            mediaDevices: { getUserMedia: async () => { requests += 1; throw { name }; } },
        }), { name });
        assert.equal(requests, 1);
    });
}

test('supports browsers that cannot query camera permission', async () => {
    const stream = { id: 'camera' };
    const result = await requestScanCamera({
        secure: true,
        permissions: { query: async () => { throw new TypeError('Unsupported permission'); } },
        mediaDevices: { getUserMedia: async () => stream },
    });
    assert.equal(result, stream);
});

test('rejects insecure connections and unsupported browsers', async () => {
    await assert.rejects(requestScanCamera({ secure: false }), { name: 'InsecureContextError' });
    await assert.rejects(requestScanCamera({ secure: true, mediaDevices: {} }), { name: 'UnsupportedCameraError' });
});

test('explains permission, busy device and missing camera errors separately', () => {
    assert.match(cameraErrorMessage({ name: 'NotAllowedError' }), /Izin kamera ditolak/);
    assert.match(cameraErrorMessage({ name: 'NotReadableError' }), /Tutup aplikasi/);
    assert.match(cameraErrorMessage({ name: 'NotFoundError' }), /Kamera tidak ditemukan/);
    assert.match(cameraErrorMessage({ name: 'InsecureContextError' }), /HTTPS/);
    assert.match(cameraErrorMessage({ name: 'UnsupportedCameraError' }), /Chrome\/Edge/);
    assert.match(cameraErrorMessage({}), /Pratinjau kamera gagal/);
});
