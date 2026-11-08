import test from 'node:test';
import assert from 'node:assert/strict';
import { guardPhotoSelection, photoLimitMiB, photoUploadError } from './photoUploadPolicy.mjs';

test('only photo-video photo galleries qualify for five MiB', () => {
    const services = [{ id: 7, slug: 'photography-videography' }];
    assert.equal(photoLimitMiB({ service_id: '7', media_type: 'photo' }, services), 5);
    for (const media_type of ['video', 'before_after']) assert.equal(photoLimitMiB({ service_id: 7, media_type }, services), 2);
    assert.equal(photoLimitMiB({ service_id: 8, media_type: 'photo' }, services), 2);
});
test('photo boundaries are inclusive, one KiB over is rejected', () => {
    for (const limit of [2, 5]) {
        assert.equal(photoUploadError({ type: 'image/jpeg', size: limit * 1024 * 1024 }, limit), '');
        assert.match(photoUploadError({ type: 'image/jpeg', size: limit * 1024 * 1024 + 1024 }, limit), /maksimal/);
    }
});
test('mixed media retains document and video allowance', () => {
    for (const type of ['video/mp4', 'application/pdf']) {
        assert.equal(photoUploadError({ type, size: 100 * 1024 * 1024 }, 2, true), '');
        assert.match(photoUploadError({ type, size: 100 * 1024 * 1024 + 1024 }, 2, true), /100 MiB/);
    }
    assert.match(photoUploadError({ type: 'application/pdf', size: 10 }, 2), /gambar/);
});

test('selection guard clears oversized input and keeps accepted selection', () => {
    const original = globalThis.alert;
    const messages = [];
    globalThis.alert = message => messages.push(message);
    try {
        const event = { target: { value: 'large.jpg', files: [{ type: 'image/jpeg', size: 2 * 1024 * 1024 + 1024 }] } };
        assert.equal(guardPhotoSelection(event), false);
        assert.equal(event.target.value, '');
        assert.equal(messages.length, 1);
        assert.equal(guardPhotoSelection({ target: { files: [{ type: 'image/jpeg', size: 2 * 1024 * 1024 }] } }), true);
    } finally { globalThis.alert = original; }
});
