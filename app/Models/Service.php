<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'hero_config_json' => 'array',
        'is_active' => 'boolean',
    ];

    public function galleries()
    {
        return $this->hasMany(Gallery::class);
    }
}
