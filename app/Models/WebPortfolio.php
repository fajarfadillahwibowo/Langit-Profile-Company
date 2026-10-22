<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebPortfolio extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'tech_stack_json' => 'array',
        'lighthouse_score' => 'integer',
    ];
}
