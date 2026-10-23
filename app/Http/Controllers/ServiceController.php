<?php

namespace App\Http\Controllers;

use App\Models\ComputerServiceTicket;
use App\Models\EducationCourse;
use App\Models\Gallery;
use App\Models\InternshipPosition;
use App\Models\RentalEquipment;
use App\Models\Service;
use App\Models\WebEstimatorComponent;
use App\Models\WebPortfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Layanan 1: Photography & Videography (Cinema & Darkroom Showcase)
     */
    public function photoVideo()
    {
        $service = Service::where('slug', 'photography-videography')->first();
        $galleries = Gallery::where('service_id', $service?->id)->get();
        $beforeAfter = Gallery::where('service_id', $service?->id)->where('media_type', 'before_after')->first()
            ?: Gallery::where('media_type', 'before_after')->first();

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
        $galleries = Gallery::where('service_id', $service?->id)->get();
        $estimatorComponents = WebEstimatorComponent::where('is_active', true)->get();

        // Sync & cleanup: Any portfolio whose gallery was deleted from admin is removed from live site
        $validPortfolioIds = [];
        if ($galleries->isNotEmpty()) {
            foreach ($galleries as $g) {
                $p = WebPortfolio::where('slug', Str::slug($g->title))
                    ->orWhere('title', $g->title)
                    ->first();

                if (! $p) {
                    $p = WebPortfolio::all()->first(function ($item) use ($g) {
                        $t1 = strtolower(trim($item->title));
                        $t2 = strtolower(trim($g->title));

                        return $t1 === $t2 || (strlen($t1) > 8 && strlen($t2) > 8 && (str_contains($t1, substr($t2, 0, 15)) || str_contains($t2, substr($t1, 0, 15))));
                    });
                }

                if ($p) {
                    $p->title = $g->title;
                    if ($g->file_webp_path) {
                        $p->desktop_preview_img = $g->file_webp_path;
                        $p->mobile_preview_img = $g->file_webp_path;
                    }
                    $p->save();
                    $validPortfolioIds[] = $p->id;
                } else {
                    $newP = WebPortfolio::create([
                        'title' => $g->title,
                        'slug' => Str::slug($g->title),
                        'client_name' => 'Klien Langit Web Dev',
                        'project_url' => 'https://langit.id',
                        'desktop_preview_img' => $g->file_webp_path,
                        'mobile_preview_img' => $g->file_webp_path,
                        'tech_stack_json' => ['Laravel 13', 'React SPA', 'Tailwind v4'],
                        'lighthouse_score' => 98,
                        'challenge_text' => 'Kebutuhan sistem arsitektur modern berkecepatan tinggi.',
                        'solution_text' => 'Mengembangkan aplikasi web responsif berstandar enterprise.',
                    ]);
                    $validPortfolioIds[] = $newP->id;
                }
            }

            WebPortfolio::whereNotIn('id', $validPortfolioIds)->delete();
        }

        $portfolios = WebPortfolio::all();

        return Inertia::render('Services/WebDevView', [
            'service' => $service,
            'portfolios' => $portfolios,
            'estimatorComponents' => $estimatorComponents,
            'galleries' => $galleries,
        ]);
    }

    /**
     * Layanan 3: Langit Education (Modern Academy & Learning Hub)
     */
    public function education()
    {
        $service = Service::where('slug', 'langit-education')->first();
        $courses = EducationCourse::where('is_open', true)->get();
        $galleries = Gallery::where('service_id', $service?->id)->get();

        return Inertia::render('Services/EducationView', [
            'service' => $service,
            'courses' => $courses,
            'galleries' => $galleries,
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
        $galleries = Gallery::where('service_id', $service?->id)->get();

        return Inertia::render('Services/ComputerServiceView', [
            'service' => $service,
            'initialTicket' => $ticket,
            'initialReceiptQuery' => $initialReceipt,
            'galleries' => $galleries,
        ]);
    }

    /**
     * Layanan 5: Internship (Startup Talent & Career Portal)
     */
    public function internship()
    {
        $service = Service::where('slug', 'internship')->first();
        $positions = InternshipPosition::where('is_open', true)->get();
        $galleries = Gallery::where('service_id', $service?->id)->get();

        return Inertia::render('Services/InternshipView', [
            'service' => $service,
            'positions' => $positions,
            'galleries' => $galleries,
        ]);
    }

    /**
     * Layanan 6: Sewa Alat (Equipment Rental Marketplace & Catalog)
     */
    public function sewaAlat()
    {
        $service = Service::where('slug', 'sewa-alat')->first();
        $galleries = Gallery::where('service_id', $service?->id)->get();

        // 1. Strict 1-to-1 Sync: RentalEquipment MUST strictly match active photos in admin gallery
        $validEquipmentIds = [];
        if ($galleries->isNotEmpty()) {
            foreach ($galleries as $g) {
                // Find matching equipment by title or slug
                $eq = RentalEquipment::where('slug', Str::slug($g->title))
                    ->orWhere('name', $g->title)
                    ->first();

                if (! $eq) {
                    $eq = RentalEquipment::all()->first(function ($item) use ($g) {
                        $t1 = strtolower(trim($item->name));
                        $t2 = strtolower(trim($g->title));

                        return $t1 === $t2 || (strlen($t1) > 8 && strlen($t2) > 8 && (str_contains($t1, substr($t2, 0, 15)) || str_contains($t2, substr($t1, 0, 15))));
                    });
                }

                if (! $eq) {
                    $price = 250000;
                    $titleLower = strtolower($g->title);
                    if (str_contains($titleLower, 'proyektor laser') || str_contains($titleLower, '5000')) {
                        $price = 350000;
                    } elseif (str_contains($titleLower, 'screen')) {
                        $price = 75000;
                    } elseif (str_contains($titleLower, 'mavic 3')) {
                        $price = 600000;
                    } elseif (str_contains($titleLower, 'mini 4')) {
                        $price = 350000;
                    } elseif (str_contains($titleLower, 'rode')) {
                        $price = 200000;
                    } elseif (str_contains($titleLower, 'aputure')) {
                        $price = 350000;
                    }

                    $eq = new RentalEquipment;
                    $eq->name = $g->title;
                    $eq->slug = Str::slug($g->title);
                    $eq->brand = $g->exif_metadata_json['camera'] ?? 'Langit Gear';
                    $eq->category = $g->category;
                    $eq->price_per_day = $price;
                    $eq->stock_total = 4;
                    $eq->stock_available = 4;
                    $eq->thumbnail_webp = $g->file_webp_path;
                    $eq->specs_json = [
                        'Brand' => $g->exif_metadata_json['camera'] ?? 'Langit Gear',
                        'Spesifikasi' => $g->exif_metadata_json['lens'] ?? 'High Quality Gear',
                        'Fitur Utama' => $g->exif_metadata_json['shutter'] ?? 'Standar Produksi Profesional',
                        'Kelengkapan' => $g->exif_metadata_json['iso'] ?? 'Unit + Hardcase + Aksesoris',
                    ];
                    $eq->is_active = true;
                    $eq->save();
                } else {
                    $eq->name = $g->title;
                    $eq->category = $g->category;
                    $eq->thumbnail_webp = $g->file_webp_path;
                    $eq->is_active = true;
                    $eq->save();
                }

                $validEquipmentIds[] = $eq->id;
            }

            // Immediately purge any equipment that has been deleted from admin galleries
            RentalEquipment::whereNotIn('id', $validEquipmentIds)->delete();
        } else {
            // Admin deleted all photos -> remove all equipments
            RentalEquipment::query()->delete();
        }

        // 2. Fetch active equipments matching active galleries
        $equipments = RentalEquipment::where('is_active', true)->orderBy('id')->get();

        return Inertia::render('Services/RentalEquipmentView', [
            'service' => $service,
            'equipments' => $equipments,
            'galleries' => $galleries,
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
