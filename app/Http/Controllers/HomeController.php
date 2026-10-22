<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Gallery;
use App\Models\WebPortfolio;
use App\Models\RentalEquipment;
use App\Models\InternshipPosition;
use App\Models\ComputerServiceTicket;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $services = Service::where('is_active', true)->get();
        $featuredGalleries = Gallery::where('is_featured', true)->take(6)->get();
        $rentalHighlights = RentalEquipment::where('is_active', true)->take(4)->get();
        $internshipOpenings = InternshipPosition::where('is_open', true)->take(3)->get();

        return Inertia::render('Home/Index', [
            'services' => $services,
            'featuredGalleries' => $featuredGalleries,
            'rentalHighlights' => $rentalHighlights,
            'internshipOpenings' => $internshipOpenings,
            'stats' => [
                'projects_delivered' => 240,
                'client_satisfaction' => '99.4%',
                'gear_inventory' => 65,
                'hardware_repaired' => 1250,
            ]
        ]);
    }
}
