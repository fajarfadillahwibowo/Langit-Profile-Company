<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPhotoFace extends Model
{
    protected $table = 'ai_photo_faces';

    protected $fillable = [
        'photo_id',
        'face_embedding',
        'bounding_box',
        'confidence_score',
    ];

    protected function casts(): array
    {
        return [
            'face_embedding' => 'array',
            'bounding_box' => 'array',
            'confidence_score' => 'float',
        ];
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(AiPhoto::class, 'photo_id');
    }
}
