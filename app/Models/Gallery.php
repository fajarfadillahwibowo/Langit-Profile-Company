<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'exif_metadata_json' => 'array',
        'is_featured' => 'boolean',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
