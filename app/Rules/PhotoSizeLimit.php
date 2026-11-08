<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/** Apply the photo cap to mixed-media uploads without lowering document/video limits. */
class PhotoSizeLimit implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            return;
        }
        // Never trust the client filename, MIME header, or media_type selector.
        $isImage = str_starts_with($value->getMimeType() ?? '', 'image/')
            || @getimagesize($value->getPathname()) !== false;
        if ($isImage && $value->getSize() > 2048 * 1024) {
            $fail('Ukuran setiap foto maksimal 2 MiB (2048 KB).');
        }
    }
}
