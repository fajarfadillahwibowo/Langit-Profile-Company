<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
        'qris_image_path',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'is_active',
        'compress_uploads_enabled',
        'compress_max_mb',
        'compress_max_dimension',
        'compress_quality',
    ];

    protected $appends = [
        'qris_image_url',
        'has_custom_qris',
    ];

    protected function casts(): array
    {
        return [
            'min_photos_selected' => 'integer',
            'discount_percentage' => 'float',
            'default_photo_price' => 'float',
            'is_active' => 'boolean',
            'compress_uploads_enabled' => 'boolean',
            'compress_max_mb' => 'float',
            'compress_max_dimension' => 'integer',
            'compress_quality' => 'integer',
        ];
    }

    public function getQrisImageUrlAttribute(): string
    {
        if (! empty($this->qris_image_path)) {
            return Storage::disk('public')->url($this->qris_image_path);
        }

        return '/images/qris-sample.svg';
    }

    public function getHasCustomQrisAttribute(): bool
    {
        return ! empty($this->qris_image_path);
    }

    public static function current(): self
    {
        $rule = static::firstOrCreate([], [
            'name' => 'Diskon Paket Foto',
            'min_photos_selected' => 5,
            'discount_percentage' => 20,
            'default_photo_price' => 25000,
            'admin_whatsapp' => '6282246142791',
            'bank_name' => 'BRI',
            'bank_account_number' => '0123-01-045678-53-9',
            'bank_account_holder' => 'Langit Creative Studio',
            'manual_payment_info' => 'Unggah bukti foto pembayaran langsung di form bawah ini agar Admin segera mengirim foto asli Anda.',
            'is_active' => true,
        ]);

        // Pastikan rekening contoh BRI terisi bila kolom masih kosong (migrasi dari skema lama)
        if (empty($rule->bank_name) && empty($rule->bank_account_number)) {
            $rule->update([
                'bank_name' => 'BRI',
                'bank_account_number' => '0123-01-045678-53-9',
                'bank_account_holder' => $rule->bank_account_holder ?: 'Langit Creative Studio',
                'manual_payment_info' => 'Unggah bukti foto pembayaran langsung di form bawah ini agar Admin segera mengirim foto asli Anda.',
            ]);
        }

        return $rule;
    }
}
