import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../Components/AdminClientDeliveryManager.jsx', import.meta.url), 'utf8');

test('delivery selectors accept original photos without per-file size guards', () => {
    assert.doesNotMatch(source, /photoUploadError|guardPhotoSelection|2 MiB|2 MB|BATCH_SIZE/);
    assert.match(source, /uploadFiles/);
    for (const [handler, setter] of [['handleFileChange', 'setSelectedFiles'], ['handleAdditionalFileChange', 'setAdditionalFiles']]) {
        const body = source.match(new RegExp(`const ${handler} = \\(e\\) => \\{([\\s\\S]*?)\\n    \\};`))?.[1];
        assert.ok(body);
        assert.match(body, new RegExp(`${setter}\\(files\\)`));
        assert.doesNotMatch(body, /size|width|height|resize|compress|alert/);
    }
    assert.ok(source.includes('Foto resolusi asli • tanpa batas ukuran per foto di aplikasi (mengikuti kapasitas server)'));
});
