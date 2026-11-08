<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationStudent extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'fee_per_cycle' => 'float',
        'registration_fee' => 'float',
        'cycle_sessions_count' => 'integer',
        'joined_at' => 'date',
    ];

    protected $appends = [
        'total_meetings',
        'current_cycle',
        'active_cycle',
        'next_meeting_number',
        'session_in_cycle',
        'is_cycle_completed',
        'paid_cycles',
        'needs_payment_reminder',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(EducationAttendance::class, 'student_id')->orderBy('meeting_number');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(EducationPayment::class, 'student_id')->orderBy('cycle_number');
    }

    public function getTotalMeetingsAttribute(): int
    {
        return $this->attendances()->count();
    }

    public function getCurrentCycleAttribute(): int
    {
        $count = $this->attendances()->count();
        if ($count === 0) {
            return 1;
        }

        return intdiv($count - 1, 8) + 1;
    }

    public function getActiveCycleAttribute(): int
    {
        $nextMeeting = $this->attendances()->count() + 1;

        return intdiv($nextMeeting - 1, 8) + 1;
    }

    public function getNextMeetingNumberAttribute(): int
    {
        return $this->attendances()->count() + 1;
    }

    public function getSessionInCycleAttribute(): int
    {
        $count = $this->attendances()->count();
        if ($count === 0) {
            return 0;
        }

        return (($count - 1) % 8) + 1;
    }

    public function getIsCycleCompletedAttribute(): bool
    {
        $count = $this->attendances()->count();

        return $count > 0 && ($count % 8 === 0);
    }

    public function getPaidCyclesAttribute(): array
    {
        return $this->payments()->where('status', 'paid')->pluck('cycle_number')->map(fn ($n) => (int) $n)->toArray();
    }

    public function getNeedsPaymentReminderAttribute(): bool
    {
        $count = $this->attendances()->count();
        if ($count === 0) {
            return ! in_array(1, $this->paid_cycles, true);
        }

        // Current cycle number
        $currentCycle = intdiv($count - 1, 8) + 1;

        // If at least one completed or current cycle is unpaid
        for ($c = 1; $c <= $currentCycle; $c++) {
            if (! in_array($c, $this->paid_cycles, true)) {
                return true;
            }
        }

        return false;
    }
}
