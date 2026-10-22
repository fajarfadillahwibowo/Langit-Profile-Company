<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebEstimatorComponent extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'base_price' => 'decimal:2',
        'estimated_days' => 'integer',
        'is_active' => 'boolean',
    ];
}
