<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_name',
        'client_email',
        'client_phone',
        'title',
        'notes',
        'expired_at',
        'is_active',
        'download_count',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
        'is_active' => 'boolean',
        'download_count' => 'integer',
    ];

    protected $appends = [
        'is_expired',
        'remaining_days',
        'total_size_formatted',
        'photo_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ClientPhoto::class);
    }

    /**
     * Cek apakah masa pengambilan foto telah kedaluwarsa
     */
    public function getIsExpiredAttribute(): bool
    {
        if (!$this->is_active) {
            return true;
        }

        return Carbon::now()->greaterThan($this->expired_at);
    }

    /**
     * Hitungan sisa hari mundur sebelum kedaluwarsa
     */
    public function getRemainingDaysAttribute(): int
    {
        if ($this->getIsExpiredAttribute()) {
            return 0;
        }

        $now = Carbon::now();
        $diffSeconds = $now->diffInSeconds($this->expired_at, false);

        if ($diffSeconds <= 0) {
            return 0;
        }

        return (int) ceil($diffSeconds / 86400);
    }

    /**
     * Total ukuran file foto dalam format yang mudah dibaca (MB)
     */
    public function getTotalSizeFormattedAttribute(): string
    {
        $bytes = $this->photos()->sum('file_size');
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }
        return number_format($bytes / 1024, 0) . ' KB';
    }

    public function getPhotoCountAttribute(): int
    {
        return $this->photos()->count();
    }
}
