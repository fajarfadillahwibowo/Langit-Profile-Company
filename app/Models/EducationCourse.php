<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationCourse extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'syllabus_json' => 'array',
        'price' => 'decimal:2',
        'quota' => 'integer',
        'is_open' => 'boolean',
    ];

    public function registrations()
    {
        return $this->hasMany(EducationRegistration::class, 'course_id');
    }
}
