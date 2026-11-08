<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationPayment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'cycle_number' => 'integer',
        'amount' => 'float',
        'payment_date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(EducationStudent::class, 'student_id');
    }
}
