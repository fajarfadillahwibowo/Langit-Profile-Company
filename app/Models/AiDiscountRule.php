<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiDiscountRule extends Model
{
    protected $table = 'ai_discount_rules';

    protected $fillable = [
        'name',
        'min_photos_selected',
        'discount_percentage',
        'default_photo_price',
        'admin_whatsapp',
        'manual_payment_info',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_photos_selected' => 'integer',
            'discount_percentage' => 'float',
            'default_photo_price' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'name' => 'Diskon Paket Foto',
            'min_photos_selected' => 5,
            'discount_percentage' => 20,
            'default_photo_price' => 25000,
            'admin_whatsapp' => '6281234567890',
            'manual_payment_info' => "Transfer BCA: 1234567890 a.n. Langit Creative Studio\nKirim bukti transfer via WhatsApp Admin agar foto asli langsung dikirim.",
            'is_active' => true,
        ]);
    }
}
