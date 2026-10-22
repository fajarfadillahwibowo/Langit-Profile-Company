<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternshipPosition extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'quota' => 'integer',
        'duration_months' => 'integer',
        'requirements_json' => 'array',
        'benefits_json' => 'array',
        'is_open' => 'boolean',
    ];

    public function applications()
    {
        return $this->hasMany(InternshipApplication::class, 'position_id');
    }
}
