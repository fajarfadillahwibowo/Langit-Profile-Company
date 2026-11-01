<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ClientPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_delivery_id',
        'file_path',
        'original_name',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    protected $appends = [
        'formatted_size',
        'file_url',
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
     * URL pratinjau foto
     */
    public function getFileUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
