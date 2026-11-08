import test from 'node:test';
import assert from 'node:assert/strict';
import { albumPhotos } from './galleryAlbum.mjs';

test('album contains only this record photos, never cover or category neighbors', () => {
 const item = {file_webp_path:'/cover', exif_metadata_json:{sub_photos:['/one','/two']}};
 assert.deepEqual(albumPhotos(item), ['/one','/two']);
});
test('legacy photo falls back to its own cover only', () => {
 assert.deepEqual(albumPhotos({file_webp_path:'/legacy', category:'wedding'}), ['/legacy']);
 assert.deepEqual(albumPhotos(null), []);
});
test('album mode is opt-in only for Portfolio and the PhotoVideo gallery tab', async () => {
 const { readFileSync } = await import('node:fs');
 const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
 assert.match(read('../Components/LightboxModal.jsx'), /albumMode = false/);
 assert.match(read('../Pages/Portfolio/Index.jsx'), /<LightboxModal\s+albumMode\s/);
 assert.match(read('../Pages/Services/PhotoVideoView.jsx'), /albumMode=\{activeTab === 'gallery'\}/);
 assert.doesNotMatch(read('../Pages/Home/Index.jsx'), /albumMode/);
});
