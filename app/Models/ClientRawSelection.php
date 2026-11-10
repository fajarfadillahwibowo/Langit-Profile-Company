<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientRawSelection extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_delivery_id',
        'user_id',
        'selected_photo_ids',
        'total_photos',
        'price_per_photo',
        'subtotal',
        'discount_percent',
        'discount_amount',
        'total_price',
        'notes',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'selected_photo_ids' => 'array',
        'total_photos' => 'integer',
        'price_per_photo' => 'float',
        'subtotal' => 'float',
        'discount_percent' => 'float',
        'discount_amount' => 'float',
        'total_price' => 'float',
    ];

    protected $appends = [
        'status_label',
        'status_badge_color',
        'selected_photos',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(ClientDelivery::class, 'client_delivery_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Dapatkan koleksi model ClientRawPhoto yang dipilih
     */
    public function getSelectedPhotosAttribute()
    {
        if (empty($this->selected_photo_ids) || !is_array($this->selected_photo_ids)) {
            return [];
        }

        return ClientRawPhoto::whereIn('id', $this->selected_photo_ids)->get();
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Menunggu Konfirmasi',
            'in_review' => 'Sedang Ditinjau',
            'editing' => 'Proses Editing',
            'completed' => 'Selesai & Diunggah',
            'cancelled' => 'Dibatalkan',
            default => 'Pending',
        };
    }

    public function getStatusBadgeColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'bg-amber-500/10 text-amber-500 border-amber-500/30',
            'in_review' => 'bg-sky-500/10 text-sky-500 border-sky-500/30',
            'editing' => 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
            'completed' => 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
            'cancelled' => 'bg-rose-500/10 text-rose-500 border-rose-500/30',
            default => 'bg-slate-500/10 text-slate-500 border-slate-500/30',
        };
    }
}
