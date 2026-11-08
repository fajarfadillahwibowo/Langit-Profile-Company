<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationAttendance extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'meeting_number' => 'integer',
        'cycle_number' => 'integer',
        'session_in_cycle' => 'integer',
        'date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(EducationStudent::class, 'student_id');
    }
}
