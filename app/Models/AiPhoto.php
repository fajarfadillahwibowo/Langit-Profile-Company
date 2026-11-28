<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiPhoto extends Model
{
    protected $table = 'ai_photos';

    protected $fillable = [
        'uploaded_by_admin_id',
        'title',
        'original_filename',
        'file_hash',
        'original_file_path',
        'preview_watermarked_path',
        'original_width',
        'original_height',
        'original_size_bytes',
        'source_size_bytes',
        'preview_size_bytes',
        'price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_admin_id');
    }

    public function faces(): HasMany
    {
        return $this->hasMany(AiPhotoFace::class, 'photo_id');
    }

    public function requestItems(): HasMany
    {
        return $this->hasMany(AiRequestItem::class, 'photo_id');
    }
}
