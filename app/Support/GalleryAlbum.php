<?php

namespace App\Support;

use App\Models\Gallery;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GalleryAlbum
{
    public static function validate(Request $request, ?Gallery $gallery = null): ?array
    {
        $serviceId = $request->input('service_id') ?: $gallery?->service_id;
        $scoped = $request->input('media_type') === 'photo'
            && Service::whereKey($serviceId)->where('slug', 'photography-videography')->exists();
        if (! $scoped) {
            return null;
        }
        $existing = array_values($gallery?->exif_metadata_json['sub_photos'] ?? []);
        $data = $request->validate([
            'file_photo' => 'nullable|image|mimes:jpeg,jpg,png,webp,gif,avif|max:5120',
            'album_photos' => 'sometimes|array|max:10',
            'album_photos.*' => 'required|image|mimes:jpeg,jpg,png,webp,gif,avif|max:5120',
            'remove_album_photos' => 'sometimes|array',
            'remove_album_photos.*' => ['required', 'integer', 'distinct', Rule::in(array_keys($existing))],
        ]);
        $remove = array_map('intval', $data['remove_album_photos'] ?? []);
        $retained = array_values(array_filter($existing, fn ($url, $index) => ! in_array($index, $remove, true), ARRAY_FILTER_USE_BOTH));
        $count = count($retained) + count($data['album_photos'] ?? []);
        // Legacy cover-only records remain editable until an album is added.
        if ($count > 10 || ($count === 0 && (! $gallery || count($existing) > 0))) {
            throw ValidationException::withMessages(['album_photos' => 'Album wajib berisi 1 sampai 10 foto, tidak termasuk thumbnail.']);
        }
        return ['retained' => $retained, 'removed' => array_values(array_diff($existing, $retained))];
    }

    public static function store(Request $request, array $plan): array
    {
        $photos = $plan['retained'];
        foreach ($request->file('album_photos', []) as $file) {
            $path = $file->store('galleries/albums', 'public');
            $photos[] = Storage::disk('public')->url($path);
        }
        return $photos;
    }

    public static function deleteFiles(array $urls, string $folder = 'albums'): void
    {
        // Only server-stored album URLs with generated basenames are removable.
        $prefix = rtrim(Storage::disk('public')->url('galleries/'.$folder), '/').'/';
        foreach ($urls as $url) {
            if (! is_string($url) || ! str_starts_with($url, $prefix)) {
                continue;
            }
            $name = substr($url, strlen($prefix));
            if (preg_match('/\A[a-zA-Z0-9]+\.(jpg|jpeg|png|webp|gif|avif)\z/', $name)) {
                Storage::disk('public')->delete('galleries/'.$folder.'/'.$name);
            }
        }
    }
}
