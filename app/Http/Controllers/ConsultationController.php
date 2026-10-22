<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function wizard()
    {
        return Inertia::render('Consultation/Wizard', [
            'availableTopics' => [
                ['id' => 'photo_video', 'title' => 'Photography & Videography (Wedding, Wisuda, Event, Traveling, Drone, Compro)', 'icon' => 'Camera', 'accent' => '#F59E0B'],
                ['id' => 'web_development', 'title' => 'Web Development (Operasi Internal, Profil Perusahaan, Pendidikan, E-Commerce)', 'icon' => 'Code2', 'accent' => '#0EA5E9'],
                ['id' => 'education_training', 'title' => 'Langit Education (Kursus Coding Robotik/Web/AI, Office, Rakit PC)', 'icon' => 'GraduationCap', 'accent' => '#10B981'],
                ['id' => 'computer_hardware', 'title' => 'Computer Service (Installasi Software, Upgrade SSD, Rakit PC, Part)', 'icon' => 'Cpu', 'accent' => '#F97316'],
                ['id' => 'internship_program', 'title' => 'Internship (Konsultasi Program Magang / PKL Industri)', 'icon' => 'Sparkles', 'accent' => '#8B5CF6'],
                ['id' => 'rental_equipment', 'title' => 'Sewa Alat (Rental Proyektor + Screen, Smart TV Display & Drone 4K)', 'icon' => 'PackageCheck', 'accent' => '#14B8A6'],
                ['id' => 'collaboration_custom', 'title' => 'Kolaborasi (Kemitraan Kampus, Sponsor Event & Vendor B2B)', 'icon' => 'Handshake', 'accent' => '#EC4899'],
            ],
            'availableTimeslots' => [
                '09:30 - 10:30 WIB',
                '11:00 - 12:00 WIB',
                '13:30 - 14:30 WIB',
                '15:00 - 16:00 WIB',
                '16:30 - 17:30 WIB',
            ],
        ]);
    }
}
