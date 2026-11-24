<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiFaceScan extends Model
{
    protected $table = 'ai_face_scans';

    protected $fillable = [
        'customer_id',
        'selected_face_embedding',
        'selected_box',
        'matched_photo_ids',
        'scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'selected_face_embedding' => 'array',
            'selected_box' => 'array',
            'matched_photo_ids' => 'array',
            'scanned_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
