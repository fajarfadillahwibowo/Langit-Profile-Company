import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('public Web Development page consumes admin galleries and renders their photos', () => {
    const page = readFileSync(new URL('../resources/js/Pages/Services/WebDevView.jsx', import.meta.url), 'utf8');
    assert.match(page, /galleries\s*=\s*\[\]/, 'Admin gallery prop must be accepted');
    assert.match(page, /<WebDevGallery\s+galleries=\{galleries\}/, 'Admin gallery photos must be rendered, not only sent as unused props');
});
