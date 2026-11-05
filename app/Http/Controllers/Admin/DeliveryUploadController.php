<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClientDelivery;
use App\Models\ClientPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DeliveryUploadController extends Controller
{
    public const CHUNK_BYTES = 8 * 1024 * 1024;

    private function authorizeUpload(Request $request, string $id, string $upload): void
    {
        abort_unless(in_array($request->user()?->role, ['admin', 'superadmin'], true), 403);
        validator(['upload' => $upload], ['upload' => 'required|uuid'])->validate();
        ClientDelivery::findOrFail($id);
    }

    private function locked(Request $request, string $id, string $upload, callable $action)
    {
        $this->authorizeUpload($request, $id, $upload);
        return DB::transaction(function () use ($request, $id, $upload, $action) {
            $session = DB::table('delivery_uploads')->where('id', $upload)->where('user_id', $request->user()->id)
                ->where('client_delivery_id', $id)->lockForUpdate()->first();
            abort_unless($session, 404);
            abort_if(! $session->client_photo_id && now()->greaterThan($session->expires_at), 410, 'Sesi upload kedaluwarsa. Pilih ulang file.');
            return $action($session);
        }, 3);
    }

    public function start(Request $request, string $id, string $upload)
    {
        $this->authorizeUpload($request, $id, $upload);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'not_regex:~[\\\\/\x00-\x1f\x7f]~'],
            'size' => 'required|integer|min:1|max:9007199254740991',
            'chunks' => 'required|integer|min:1|max:1073741824',
        ]);
        if ((int) ceil($data['size'] / self::CHUNK_BYTES) !== (int) $data['chunks']) {
            throw ValidationException::withMessages(['chunks' => 'Jumlah potongan tidak cocok dengan ukuran file.']);
        }
        // UUID primary key is the idempotency key, bound immutably to admin + album + metadata.
        DB::table('delivery_uploads')->insertOrIgnore([
            'id' => $upload, 'user_id' => $request->user()->id, 'client_delivery_id' => $id,
            'original_name' => $data['name'], 'size' => $data['size'], 'chunks' => $data['chunks'],
            'expires_at' => now()->addDays(7), 'created_at' => now(), 'updated_at' => now(),
        ]);
        return $this->locked($request, $id, $upload, function ($session) use ($data) {
            abort_if($session->original_name !== $data['name'] || (int) $session->size !== (int) $data['size'] || (int) $session->chunks !== (int) $data['chunks'], 409);
            $received = [];
            if (! $session->client_photo_id) {
                foreach (Storage::disk('local')->files("delivery_uploads/{$session->id}") as $part) {
                    if (preg_match('/^(\d+)\.part$/', basename($part), $match) && (int) $match[1] < $session->chunks) {
                        $received[] = (int) $match[1];
                    }
                }
            }
            return response()->json(['received' => $received, 'complete' => (bool) $session->client_photo_id,
                'photo_id' => $session->client_photo_id, 'total_photos' => ClientPhoto::where('client_delivery_id', $session->client_delivery_id)->count()]);
        });
    }

    public function chunk(Request $request, string $id, string $upload)
    {
        return $this->locked($request, $id, $upload, function ($session) use ($request) {
            $data = $request->validate(['index' => 'required|integer|min:0', 'sha256' => 'required|regex:/^[a-f0-9]{64}$/', 'chunk' => 'required|file|max:8192']);
            abort_if($data['index'] >= $session->chunks, 422);
            if ($session->client_photo_id) { return response()->json(['accepted' => true, 'complete' => true]); }
            $file = $request->file('chunk');
            $expected = min(self::CHUNK_BYTES, $session->size - $data['index'] * self::CHUNK_BYTES);
            abort_unless(filesize($file->getPathname()) === $expected && hash_equals($data['sha256'], hash_file('sha256', $file->getPathname())), 422, 'Ukuran/hash potongan tidak cocok.');
            $disk = Storage::disk('local');
            $path = "delivery_uploads/{$session->id}/{$data['index']}.part";
            if ($disk->exists($path)) {
                abort_unless(hash_equals($data['sha256'], hash_file('sha256', $disk->path($path))), 409, 'Potongan berbeda sudah diterima.');
            } else {
                $stream = fopen($file->getPathname(), 'rb');
                try { abort_unless($disk->put($path.'.pending', $stream), 507); } finally { fclose($stream); }
                abort_unless($disk->put($path.'.sha256', $data['sha256']), 507);
                abort_unless($disk->move($path.'.pending', $path), 507);
            }
            DB::table('delivery_uploads')->where('id', $session->id)->update(['expires_at' => now()->addDays(7), 'updated_at' => now()]);
            return response()->json(['accepted' => true, 'index' => (int) $data['index'], 'bytes' => $expected]);
        });
    }

    public function complete(Request $request, string $id, string $upload)
    {
        return $this->locked($request, $id, $upload, function ($session) {
            if ($session->client_photo_id) {
                abort_unless(ClientPhoto::find($session->client_photo_id), 409);
                return $this->ack($session->client_delivery_id, $session->client_photo_id);
            }
            $disk = Storage::disk('local');
            $dir = "delivery_uploads/{$session->id}";
            $disk->makeDirectory($dir);
            $assembled = $disk->path($dir.'/assembled');
            $out = fopen($assembled, 'wb');
            abort_unless($out, 507);
            $wholeHash = hash_init('sha256');
            try {
                for ($i = 0; $i < $session->chunks; $i++) {
                    $part = "$dir/{$i}.part";
                    abort_unless($disk->exists($part), 409, 'Potongan belum lengkap.');
                    $expected = min(self::CHUNK_BYTES, $session->size - $i * self::CHUNK_BYTES);
                    abort_unless(filesize($disk->path($part)) === $expected && hash_equals(trim($disk->get($part.'.sha256') ?? ''), hash_file('sha256', $disk->path($part))), 422, 'Potongan rusak.');
                    $in = fopen($disk->path($part), 'rb');
                    try {
                        while (! feof($in)) {
                            $buffer = fread($in, 1024 * 1024);
                            abort_if($buffer === false, 507);
                            hash_update($wholeHash, $buffer);
                            abort_unless(fwrite($out, $buffer) === strlen($buffer), 507);
                        }
                    } finally { fclose($in); }
                }
            } finally { fclose($out); }
            clearstatcache(true, $assembled);
            abort_unless(filesize($assembled) === (int) $session->size && hash_equals(hash_final($wholeHash), hash_file('sha256', $assembled)), 422);
            $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($assembled) ?: 'application/octet-stream';
            $isImage = str_starts_with($mime, 'image/') || @getimagesize($assembled) !== false;
            abort_if(! $isImage && $session->size > 102400 * 1024, 422, 'Dokumen/video maksimal 100 MiB.');
            // Random UUID path, no user-provided path or executable extension; original bytes are untouched.
            $extension = match ($mime) {
                'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
                'image/gif' => 'gif', 'image/avif' => 'avif', 'image/tiff' => 'tif',
                'image/heic' => 'heic', 'application/pdf' => 'pdf', 'video/mp4' => 'mp4',
                'video/quicktime' => 'mov', default => 'bin',
            };
            $path = "client_photos/{$session->client_delivery_id}/{$session->id}.{$extension}";
            $stream = fopen($assembled, 'rb');
            try { abort_unless(Storage::disk('public')->put($path, $stream), 507); } finally { fclose($stream); }
            abort_unless(Storage::disk('public')->size($path) === (int) $session->size, 507);
            $photo = ClientPhoto::create(['client_delivery_id' => $session->client_delivery_id, 'file_path' => $path,
                'original_name' => $session->original_name, 'file_size' => $session->size, 'mime_type' => $mime]);
            DB::table('delivery_uploads')->where('id', $session->id)->update(['client_photo_id' => $photo->id, 'updated_at' => now()]);
            // Keep the idempotency record, remove private chunks only after the transaction commits.
            DB::afterCommit(function () use ($disk, $dir, $photo) {
                $disk->deleteDirectory($dir);
                \App\Support\ClientPhotoThumbnail::generate($photo);
            });
            return $this->ack($session->client_delivery_id, $photo->id);
        });
    }

    private function ack(int $delivery, int $photo)
    {
        return response()->json(['complete' => true, 'photo_id' => $photo,
            'total_photos' => ClientPhoto::where('client_delivery_id', $delivery)->count()]);
    }
}
