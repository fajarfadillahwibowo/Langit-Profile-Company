<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRequestItem extends Model
{
    protected $table = 'ai_request_items';

    protected $fillable = [
        'request_id',
        'photo_id',
        'price_at_request',
        'is_original_unlocked',
        'delivered_original_file_path',
    ];

    protected function casts(): array
    {
        return [
            'price_at_request' => 'float',
            'is_original_unlocked' => 'boolean',
        ];
    }

    public function photoRequest(): BelongsTo
    {
        return $this->belongsTo(AiPhotoRequest::class, 'request_id');
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(AiPhoto::class, 'photo_id');
    }
}
