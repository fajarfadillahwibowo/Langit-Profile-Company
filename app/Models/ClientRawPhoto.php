<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ClientRawPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_delivery_id',
        'file_path',
        'original_name',
        'file_size',
        'mime_type',
        'price',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'formatted_size',
        'preview_url',
        'file_url',
        'effective_price',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(ClientDelivery::class, 'client_delivery_id');
    }

    /**
     * Format ukuran file asli (MB / KB)
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        return number_format($bytes / 1024, 0) . ' KB';
    }

    /**
     * URL file asli di disk publik
     */
    public function getFileUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * URL pratinjau foto mentahan ber-watermark & terkompresi
     */
    public function getPreviewUrlAttribute(): string
    {
        return \App\Support\ClientRawPhotoThumbnail::url($this);
    }

    /**
     * Harga efektif foto mentahan (menggunakan harga khusus foto atau default album)
     */
    public function getEffectivePriceAttribute(): float
    {
        if ($this->price !== null && $this->price > 0) {
            return (float) $this->price;
        }

        if ($this->relationLoaded('delivery') && $this->delivery) {
            return (float) ($this->delivery->raw_price_per_photo ?? 15000);
        }

        return 15000.0;
    }
}
