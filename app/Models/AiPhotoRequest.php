<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiPhotoRequest extends Model
{
    protected $table = 'ai_photo_requests';

    protected $fillable = [
        'request_code',
        'customer_id',
        'total_selected_photos',
        'subtotal_price',
        'discount_percentage_applied',
        'discount_amount',
        'total_final_price',
        'status',
        'payment_method',
        'payment_proof_path',
        'payment_proof_original_name',
        'payment_proof_uploaded_at',
        'payment_confirmed_at',
        'customer_notes',
        'admin_notes',
        'requested_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_price' => 'float',
            'discount_percentage_applied' => 'float',
            'discount_amount' => 'float',
            'total_final_price' => 'float',
            'payment_proof_uploaded_at' => 'datetime',
            'payment_confirmed_at' => 'datetime',
            'requested_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AiRequestItem::class, 'request_id');
    }
}
