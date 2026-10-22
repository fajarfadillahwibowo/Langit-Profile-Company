<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Gallery;
use App\Models\WebPortfolio;
use App\Models\WebEstimatorComponent;
use App\Models\EducationCourse;
use App\Models\ComputerServiceTicket;
use App\Models\RentalEquipment;
use App\Models\InternshipPosition;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Layanan 1: Photography & Videography (Cinema & Darkroom Showcase)
     */
    public function photoVideo()
    {
        $service = Service::where('slug', 'photography-videography')->first();
        $galleries = Gallery::all();
        $beforeAfter = Gallery::where('media_type', 'before_after')->first();

        return Inertia::render('Services/PhotoVideoView', [
            'service' => $service,
            'galleries' => $galleries,
            'beforeAfter' => $beforeAfter,
        ]);
    }

    /**
     * Layanan 2: Web Development (IDE & Cyber-Architecture Blueprint)
     */
    public function webDev()
    {
        $service = Service::where('slug', 'web-development')->first();
        $portfolios = WebPortfolio::all();
        $estimatorComponents = WebEstimatorComponent::where('is_active', true)->get();

        return Inertia::render('Services/WebDevView', [
            'service' => $service,
            'portfolios' => $portfolios,
            'estimatorComponents' => $estimatorComponents,
        ]);
    }

    /**
     * Layanan 3: Langit Education (Modern Academy & Learning Hub)
     */
    public function education()
    {
        $service = Service::where('slug', 'langit-education')->first();
        $courses = EducationCourse::where('is_open', true)->get();

        return Inertia::render('Services/EducationView', [
            'service' => $service,
            'courses' => $courses,
        ]);
    }

    /**
     * Layanan 4: Computer Service (Hardware Diagnostic & Command Center)
     */
    public function computerService(Request $request)
    {
        $service = Service::where('slug', 'computer-service')->first();
        $initialReceipt = $request->query('receipt');
        $ticket = null;

        if ($initialReceipt) {
            $ticket = ComputerServiceTicket::where('receipt_number', $initialReceipt)->first();
        }

        return Inertia::render('Services/ComputerServiceView', [
            'service' => $service,
            'initialTicket' => $ticket,
            'initialReceiptQuery' => $initialReceipt,
        ]);
    }

    /**
     * Layanan 5: Internship (Startup Talent & Career Portal)
     */
    public function internship()
    {
        $service = Service::where('slug', 'internship')->first();
        $positions = InternshipPosition::where('is_open', true)->get();

        return Inertia::render('Services/InternshipView', [
            'service' => $service,
            'positions' => $positions,
        ]);
    }

    /**
     * Layanan 6: Sewa Alat (Equipment Rental Marketplace & Catalog)
     */
    public function sewaAlat()
    {
        $service = Service::where('slug', 'sewa-alat')->first();
        $equipments = RentalEquipment::where('is_active', true)->get();

        return Inertia::render('Services/RentalEquipmentView', [
            'service' => $service,
            'equipments' => $equipments,
        ]);
    }

    /**
     * Layanan 7: Kolaborasi (Executive B2B Partnership & Pitch Deck)
     */
    public function kolaborasi()
    {
        $service = Service::where('slug', 'kolaborasi')->first();

        return Inertia::render('Services/CollaborationView', [
            'service' => $service,
        ]);
    }
}
