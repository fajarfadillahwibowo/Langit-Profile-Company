import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('login uses a neutral placeholder without exposing an example admin email', () => {
    const source = readFileSync(new URL('../Pages/Auth/Login.jsx', import.meta.url), 'utf8');
    assert.ok(source.includes('placeholder="Masukkan nama pengguna atau email"'));
    assert.ok(!source.includes('admin@langit.id'));
});
