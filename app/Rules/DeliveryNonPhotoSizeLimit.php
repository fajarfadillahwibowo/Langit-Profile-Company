<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/** Original delivery photos are uncapped; other files retain their 100 MiB limit. */
class DeliveryNonPhotoSizeLimit implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            return;
        }

        // Inspect actual content, not the client filename or MIME header.
        $isImage = str_starts_with($value->getMimeType() ?? '', 'image/')
            || @getimagesize($value->getPathname()) !== false;

        if (! $isImage && $value->getSize() > 102400 * 1024) {
            $fail('Ukuran setiap dokumen atau video maksimal 100 MiB (102400 KB).');
        }
    }
}
