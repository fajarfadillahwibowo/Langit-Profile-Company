<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalEquipment extends Model
{
    use HasFactory;

    protected $table = 'rental_equipments';

    protected $guarded = ['id'];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'stock_total' => 'integer',
        'stock_available' => 'integer',
        'specs_json' => 'array',
        'is_active' => 'boolean',
    ];
}
