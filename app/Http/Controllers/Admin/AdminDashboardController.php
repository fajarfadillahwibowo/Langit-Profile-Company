<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collaboration;
use App\Models\ComputerServiceTicket;
use App\Models\Consultation;
use App\Models\EducationCourse;
use App\Models\Gallery;
use App\Models\InternshipApplication;
use App\Models\RentalBooking;
use App\Models\RentalEquipment;
use App\Models\Service;
use App\Models\WebEstimatorComponent;
use App\Models\WebPortfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Main Admin Dashboard & Analytics (PRD 6.1)
     */
    public function index()
    {
        $metrics = [
            'total_consultations' => Consultation::count(),
            'pending_service_tickets' => ComputerServiceTicket::whereIn('status', ['received', 'waiting_part', 'repairing', 'qc_testing'])->count(),
            'active_rentals' => RentalBooking::whereIn('status', ['approved', 'picked_up'])->count(),
            'internship_applicants' => InternshipApplication::count(),
            'total_galleries' => Gallery::count(),
            'total_equipments' => RentalEquipment::count(),
            'total_collaborations' => Collaboration::count(),
            'pending_collaborations' => Collaboration::whereIn('status', ['new', 'in_discussion'])->count(),
        ];

        $services = Service::all();
        $this->ensureServiceGalleriesExist($services);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recentConsultations' => Consultation::latest()->take(5)->get(),
            'serviceTickets' => ComputerServiceTicket::latest()->take(10)->get(),
            'rentalBookings' => RentalBooking::latest()->take(10)->get(),
            'internshipApplications' => InternshipApplication::with('position')->latest()->take(10)->get(),
            'collaborations' => Collaboration::latest()->get(),
            'galleries' => Gallery::with('service')->latest()->get(),
            'services' => $services,
            'equipments' => RentalEquipment::all(),
            'courses' => EducationCourse::withCount('registrations')->get(),
            'webPortfolios' => WebPortfolio::all(),
            'estimatorComponents' => WebEstimatorComponent::all(),
        ]);
    }

    /**
     * Update Computer Service Ticket Status
     */
    public function updateTicketStatus(Request $request, $id)
    {
        $ticket = ComputerServiceTicket::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:received,waiting_part,repairing,qc_testing,ready,completed',
            'diagnosis_result' => 'nullable|string',
            'estimated_cost' => 'nullable|numeric',
            'final_cost' => 'nullable|numeric',
        ]);

        $ticket->update($validated);

        return back()->with('success', "Status tiket {$ticket->receipt_number} berhasil diperbarui ke ".strtoupper($ticket->status));
    }

    /**
     * Create New Service Ticket
     */
    public function createTicket(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'device_type' => 'required|string|max:255',
            'device_brand_model' => 'required|string|max:255',
            'problem_reported' => 'required|string',
            'estimated_cost' => 'nullable|numeric',
        ]);

        $receiptNumber = 'SRV-'.date('Y').'-'.str_pad(ComputerServiceTicket::count() + 1, 4, '0', STR_PAD_LEFT);

        ComputerServiceTicket::create([
            'receipt_number' => $receiptNumber,
            'customer_name' => $validated['customer_name'],
            'whatsapp' => $validated['whatsapp'],
            'device_type' => $validated['device_type'],
            'device_brand_model' => $validated['device_brand_model'],
            'problem_reported' => $validated['problem_reported'],
            'status' => 'received',
            'estimated_cost' => $validated['estimated_cost'] ?? 0,
        ]);

        return back()->with('success', "Tiket baru [{$receiptNumber}] berhasil diterbitkan.");
    }

    /**
     * Update Rental Booking Status
     */
    public function updateRentalBookingStatus(Request $request, $id)
    {
        $booking = RentalBooking::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,picked_up,returned,cancelled',
        ]);

        $booking->update($validated);

        return back()->with('success', "Status pesanan sewa {$booking->booking_code} diperbarui.");
    }

    /**
     * Update Rental Equipment Stock
     */
    public function updateEquipment(Request $request, $id)
    {
        $equipment = RentalEquipment::findOrFail($id);
        $validated = $request->validate([
            'stock_available' => 'required|integer|min:0',
            'price_per_day' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $equipment->update($validated);

        return back()->with('success', "Data alat {$equipment->name} berhasil disimpan.");
    }

    /**
     * Add New Gallery Item (Photo / Before-After)
     */
    public function createGallery(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'service_id' => 'nullable|exists:services,id',
            'category' => 'required|string|max:100',
            'media_type' => 'required|string|in:photo,video,before_after',
            'file_webp_path' => 'nullable|string',
            'file_photo' => 'nullable|file|mimes:jpeg,png,webp,jpg,gif|max:10240',
            'before_file_path' => 'nullable|string',
            'camera' => 'nullable|string',
            'lens' => 'nullable|string',
            'shutter' => 'nullable|string',
            'aperture' => 'nullable|string',
            'iso' => 'nullable|string',
        ]);

        $filePath = $validated['file_webp_path'] ?? '';
        if ($request->hasFile('file_photo')) {
            $file = $request->file('file_photo');
            $dest = public_path('uploads/galleries');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $filePath = '/uploads/galleries/'.$filename;
        }

        if (empty($filePath)) {
            return back()->withErrors(['file_webp_path' => 'Silakan upload berkas foto atau masukkan tautan URL foto valid.']);
        }

        Gallery::create([
            'service_id' => $validated['service_id'] ?? null,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']).'-'.time(),
            'category' => $validated['category'],
            'media_type' => $validated['media_type'],
            'file_webp_path' => $filePath,
            'before_file_path' => $validated['before_file_path'] ?? null,
            'exif_metadata_json' => [
                'camera' => $validated['camera'] ?? 'Sony FX3',
                'lens' => $validated['lens'] ?? '24-70mm GM II',
                'shutter' => $validated['shutter'] ?? '1/500s',
                'aperture' => $validated['aperture'] ?? 'f/2.8',
                'iso' => $validated['iso'] ?? '100',
            ],
            'is_featured' => true,
        ]);

        return back()->with('success', 'Foto galeri baru berhasil ditambahkan!');
    }

    /**
     * Update / Replace Gallery Item Photo & Metadata
     */
    public function updateGallery(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'service_id' => 'nullable|exists:services,id',
            'category' => 'required|string|max:100',
            'media_type' => 'required|string|in:photo,video,before_after',
            'file_webp_path' => 'nullable|string',
            'file_photo' => 'nullable|file|mimes:jpeg,png,webp,jpg,gif|max:10240',
            'before_file_path' => 'nullable|string',
            'camera' => 'nullable|string',
            'lens' => 'nullable|string',
            'shutter' => 'nullable|string',
            'aperture' => 'nullable|string',
            'iso' => 'nullable|string',
        ]);

        $filePath = ! empty($validated['file_webp_path']) ? $validated['file_webp_path'] : $gallery->file_webp_path;
        if ($request->hasFile('file_photo')) {
            $file = $request->file('file_photo');
            $dest = public_path('uploads/galleries');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $filePath = '/uploads/galleries/'.$filename;
        }

        $beforeFilePath = $gallery->before_file_path;
        if ($request->hasFile('before_file_photo')) {
            $file = $request->file('before_file_photo');
            $dest = public_path('uploads/galleries');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'before_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $beforeFilePath = '/uploads/galleries/'.$filename;
        } elseif (isset($validated['before_file_path'])) {
            $beforeFilePath = $validated['before_file_path'];
        }

        $videoUrl = $gallery->video_url;
        if ($request->hasFile('file_video')) {
            $file = $request->file('file_video');
            $dest = public_path('uploads/videos');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'video_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $videoUrl = '/uploads/videos/'.$filename;
        } elseif ($request->filled('video_url')) {
            $videoUrl = $request->video_url;
        }

        $exif = $gallery->exif_metadata_json ?? [];
        if (isset($validated['camera'])) {
            $exif['camera'] = $validated['camera'];
        }
        if (isset($validated['lens'])) {
            $exif['lens'] = $validated['lens'];
        }
        if (isset($validated['shutter'])) {
            $exif['shutter'] = $validated['shutter'];
        }
        if (isset($validated['aperture'])) {
            $exif['aperture'] = $validated['aperture'];
        }
        if (isset($validated['iso'])) {
            $exif['iso'] = $validated['iso'];
        }

        $gallery->update([
            'title' => $validated['title'],
            'service_id' => $validated['service_id'] ?? $gallery->service_id,
            'category' => $validated['category'],
            'media_type' => $validated['media_type'],
            'file_webp_path' => $filePath,
            'before_file_path' => $beforeFilePath,
            'video_url' => $videoUrl,
            'exif_metadata_json' => $exif,
        ]);

        // Sync with related model on the live pages
        $service = $gallery->service ?: Service::find($gallery->service_id);
        if ($service && $service->slug === 'web-development') {
            $portfolio = WebPortfolio::where('title', $gallery->title)
                ->orWhere('title', 'like', '%'.Str::before($gallery->title, ' ').'%')
                ->first();
            if ($portfolio) {
                $portfolio->update([
                    'desktop_preview_img' => $filePath,
                    'mobile_preview_img' => $filePath,
                ]);
            }
        } elseif ($service && $service->slug === 'sewa-alat') {
            $equipment = RentalEquipment::where('name', $gallery->title)
                ->orWhere('name', 'like', '%'.$gallery->title.'%')
                ->orWhere('name', 'like', '%'.Str::before($gallery->title, ' ').'%')
                ->first();
            if ($equipment) {
                $equipment->update(['thumbnail_webp' => $filePath]);
            }
        }

        return back()->with('success', "Foto galeri '{$gallery->title}' berhasil diperbarui / diganti!");
    }

    /**
     * Dedicated Action: Update Before / After Color Grading Photos
     */
    public function updateBeforeAfter(Request $request)
    {
        $validated = $request->validate([
            'before_photo' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:10240',
            'before_file_path' => 'nullable|string',
            'after_photo' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:10240',
            'after_file_path' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'before_label' => 'nullable|string|max:100',
            'after_label' => 'nullable|string|max:100',
        ]);

        $service = Service::where('slug', 'photography-videography')->first();
        $gallery = Gallery::where('service_id', $service?->id)->where('media_type', 'before_after')->first()
            ?: Gallery::where('media_type', 'before_after')->first();

        if (! $gallery) {
            $gallery = new Gallery;
            $gallery->service_id = $service?->id;
            $gallery->title = 'Cinema Color Grading Master Showcase';
            $gallery->slug = 'cinema-color-grading-master-showcase';
            $gallery->category = 'company_profile';
            $gallery->media_type = 'before_after';
            $gallery->file_webp_path = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80';
            $gallery->before_file_path = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80';
            $gallery->is_featured = true;
        }

        // Process Before Photo
        if ($request->hasFile('before_photo')) {
            $file = $request->file('before_photo');
            $dest = public_path('uploads/galleries');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'before_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $gallery->before_file_path = '/uploads/galleries/'.$filename;
        } elseif (! empty($validated['before_file_path'])) {
            $gallery->before_file_path = $validated['before_file_path'];
        }

        // Process After Photo
        if ($request->hasFile('after_photo')) {
            $file = $request->file('after_photo');
            $dest = public_path('uploads/galleries');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'after_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $gallery->file_webp_path = '/uploads/galleries/'.$filename;
        } elseif (! empty($validated['after_file_path'])) {
            $gallery->file_webp_path = $validated['after_file_path'];
        }

        if (! empty($validated['title'])) {
            $gallery->title = $validated['title'];
        }

        $exif = $gallery->exif_metadata_json ?? [];
        if (! empty($validated['before_label'])) {
            $exif['before_label'] = $validated['before_label'];
        }
        if (! empty($validated['after_label'])) {
            $exif['after_label'] = $validated['after_label'];
        }
        $gallery->exif_metadata_json = $exif;

        $gallery->save();

        return back()->with('success', 'Foto Before / After Color Grading berhasil diperbarui dan aktif di website!');
    }

    /**
     * Dedicated Action: Update Cinema Showcase Showreel Video & Poster
     */
    public function updateShowreel(Request $request)
    {
        $validated = $request->validate([
            'video_file' => 'nullable|file|mimes:mp4,mov,webm,mkv|max:102400', // max 100MB
            'video_url' => 'nullable|string',
            'poster_photo' => 'nullable|file|mimes:jpeg,png,webp,jpg|max:10240',
            'poster_url' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string',
        ]);

        $service = Service::where('slug', 'photography-videography')->first();
        $gallery = Gallery::where('service_id', $service?->id)
            ->where(function ($q) {
                $q->where('media_type', 'video')->orWhere('category', 'showreel');
            })->first();

        if (! $gallery) {
            $gallery = new Gallery;
            $gallery->service_id = $service?->id;
            $gallery->title = 'Cinema & Darkroom Showcase Showreel';
            $gallery->slug = 'cinema-showreel-showcase';
            $gallery->category = 'showreel';
            $gallery->media_type = 'video';
            $gallery->file_webp_path = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80';
            $gallery->is_featured = true;
        }

        // Process Video File or URL
        if ($request->hasFile('video_file')) {
            $file = $request->file('video_file');
            $dest = public_path('uploads/videos');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'showreel_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $gallery->video_url = '/uploads/videos/'.$filename;
        } elseif (! empty($validated['video_url'])) {
            $gallery->video_url = $validated['video_url'];
        }

        // Process Poster File or URL
        if ($request->hasFile('poster_photo')) {
            $file = $request->file('poster_photo');
            $dest = public_path('uploads/galleries');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'poster_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $gallery->file_webp_path = '/uploads/galleries/'.$filename;
        } elseif (! empty($validated['poster_url'])) {
            $gallery->file_webp_path = $validated['poster_url'];
        }

        if (! empty($validated['title'])) {
            $gallery->title = $validated['title'];
        }

        $gallery->save();

        // Also sync to service hero_config_json if exists
        if ($service) {
            $config = $service->hero_config_json ?? [];
            if ($gallery->video_url) {
                $config['showreel_video'] = $gallery->video_url;
            }
            if ($gallery->file_webp_path) {
                $config['showreel_poster'] = $gallery->file_webp_path;
            }
            if (! empty($validated['title'])) {
                $config['showreel_title'] = $validated['title'];
            }
            if (! empty($validated['subtitle'])) {
                $config['showreel_subtitle'] = $validated['subtitle'];
            }
            $service->update(['hero_config_json' => $config]);
        }

        return back()->with('success', 'Video Showreel Cinema berhasil diupload & aktif di website!');
    }

    /**
     * Delete Gallery Item
     */
    public function deleteGallery($id)
    {
        $gallery = Gallery::findOrFail($id);

        // Sync deletion with related models on live public pages
        $service = $gallery->service ?: Service::find($gallery->service_id);
        if ($service && $service->slug === 'sewa-alat') {
            RentalEquipment::where('name', $gallery->title)
                ->orWhere('slug', Str::slug($gallery->title))
                ->orWhere('thumbnail_webp', $gallery->file_webp_path)
                ->delete();
        } elseif ($service && $service->slug === 'web-development') {
            WebPortfolio::where('title', $gallery->title)
                ->orWhere('slug', Str::slug($gallery->title))
                ->orWhere('desktop_preview_img', $gallery->file_webp_path)
                ->delete();
        }

        // Delete physical file if uploaded in public/uploads/galleries
        if ($gallery->file_webp_path && str_starts_with($gallery->file_webp_path, '/uploads/galleries/')) {
            $fullPath = public_path(ltrim($gallery->file_webp_path, '/'));
            if (file_exists($fullPath)) {
                @unlink($fullPath);
            }
        }

        $gallery->delete();

        return back()->with('success', 'Foto galeri berhasil dihapus dan disinkronkan ke halaman publik.');
    }

    /**
     * Update Internship Application Status
     */
    public function updateApplicationStatus(Request $request, $id)
    {
        $app = InternshipApplication::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:submitted,reviewed,interview,accepted,rejected',
        ]);

        $app->update($validated);

        return back()->with('success', "Status pelamar {$app->full_name} diubah.");
    }

    /**
     * Update Consultation Status
     */
    public function updateConsultationStatus(Request $request, $id)
    {
        $cns = Consultation::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:scheduled,completed,rescheduled,cancelled',
        ]);

        $cns->update($validated);

        return back()->with('success', "Status konsultasi {$cns->ticket_code} diubah.");
    }

    /**
     * Update Collaboration Proposal Status
     */
    public function updateCollaborationStatus(Request $request, $id)
    {
        $collab = Collaboration::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:new,in_discussion,approved,declined',
        ]);

        $collab->update($validated);

        return back()->with('success', "Status proposal kerja sama {$collab->organization_name} berhasil diperbarui.");
    }

    /**
     * Delete Collaboration Proposal
     */
    public function deleteCollaboration($id)
    {
        $collab = Collaboration::findOrFail($id);
        $collab->delete();

        return back()->with('success', 'Proposal kerja sama berhasil dihapus.');
    }

    /**
     * Delete Computer Service Ticket
     */
    public function deleteTicket($id)
    {
        $ticket = ComputerServiceTicket::findOrFail($id);
        $ticket->delete();

        return back()->with('success', 'Nota servis komputer berhasil dihapus.');
    }

    /**
     * Delete Rental Booking
     */
    public function deleteRentalBooking($id)
    {
        $booking = RentalBooking::findOrFail($id);
        $booking->delete();

        return back()->with('success', 'Pesanan sewa alat berhasil dihapus.');
    }

    /**
     * Delete Internship Application
     */
    public function deleteInternshipApplication($id)
    {
        $app = InternshipApplication::findOrFail($id);
        $app->delete();

        return back()->with('success', 'Data pelamar magang berhasil dihapus.');
    }

    /**
     * Delete Consultation Ticket
     */
    public function deleteConsultation($id)
    {
        $cns = Consultation::findOrFail($id);
        $cns->delete();

        return back()->with('success', 'Tiket konsultasi berhasil dihapus.');
    }

    /**
     * Update Computer Service Ticket Details
     */
    public function updateTicket(Request $request, $id)
    {
        $ticket = ComputerServiceTicket::findOrFail($id);
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'device_type' => 'required|string|max:255',
            'device_brand_model' => 'required|string|max:255',
            'problem_reported' => 'required|string',
            'status' => 'required|in:received,waiting_part,repairing,qc_testing,ready,completed',
            'estimated_cost' => 'nullable|numeric',
            'final_cost' => 'nullable|numeric',
        ]);

        $ticket->update($validated);

        return back()->with('success', "Nota servis {$ticket->receipt_number} berhasil diperbarui.");
    }

    /**
     * Update Rental Equipment Booking Details
     */
    public function updateRentalBooking(Request $request, $id)
    {
        $booking = RentalBooking::findOrFail($id);
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'identity_card_type' => 'required|string|max:50',
            'identity_card_number' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'total_days' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
            'status' => 'required|in:pending,approved,picked_up,returned,cancelled',
        ]);

        $booking->update($validated);

        return back()->with('success', "Pesanan sewa {$booking->booking_code} berhasil diperbarui.");
    }

    /**
     * Update Internship Application Details
     */
    public function updateInternshipApplication(Request $request, $id)
    {
        $app = InternshipApplication::findOrFail($id);
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:50',
            'institution_name' => 'required|string|max:255',
            'major' => 'required|string|max:255',
            'status' => 'required|in:submitted,reviewed,interview,accepted,rejected',
        ]);

        $app->update($validated);

        return back()->with('success', "Data pelamar magang {$app->full_name} berhasil diperbarui.");
    }

    /**
     * Update Consultation Ticket Details
     */
    public function updateConsultation(Request $request, $id)
    {
        $cns = Consultation::findOrFail($id);
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'company_or_institution' => 'nullable|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'service_topic' => 'required|string|max:255',
            'preferred_date' => 'required|string',
            'preferred_time' => 'required|string',
            'meeting_method' => 'required|in:online_meet,studio',
            'budget_estimation' => 'nullable|string',
            'status' => 'required|in:scheduled,completed,rescheduled,cancelled',
            'project_brief' => 'nullable|string',
        ]);

        $cns->update($validated);

        return back()->with('success', "Tiket konsultasi {$cns->ticket_code} berhasil diperbarui.");
    }

    /**
     * Update Collaboration Proposal Details
     */
    public function updateCollaboration(Request $request, $id)
    {
        $collab = Collaboration::findOrFail($id);
        $validated = $request->validate([
            'organization_name' => 'required|string|max:255',
            'pic_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:50',
            'collab_type' => 'required|string|max:100',
            'event_date' => 'nullable|date',
            'status' => 'required|in:new,in_discussion,approved,declined',
            'description' => 'nullable|string',
        ]);

        $collab->update($validated);

        return back()->with('success', "Proposal kerja sama {$collab->organization_name} berhasil diperbarui.");
    }

    /**
     * Ensure each real service has genuine showcase galleries matching the live website pages.
     * Note: Kolaborasi does NOT have photos on its page and is strictly excluded.
     */
    private function ensureServiceGalleriesExist($services): void
    {
        // 1. Strictly remove any fake/unwanted galleries for Kolaborasi
        $collabService = Service::where('slug', 'kolaborasi')->first();
        if ($collabService) {
            Gallery::where('service_id', $collabService->id)->delete();
        }
        Gallery::whereIn('category', ['campus_mou', 'sponsorship', 'b2b_partner', 'community'])->delete();

        $serviceMap = [];
        foreach ($services as $s) {
            $serviceMap[$s->slug] = $s->id;
        }

        // 2. Real photos corresponding directly to the actual cards on the service pages
        $seedSamples = [
            'web-development' => [
                [
                    'title' => 'Sistem Operasi Internal Perusahaan & ERP',
                    'slug' => 'sistem-operasi-internal-perusahaan-erp',
                    'category' => 'enterprise',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Cyber Architecture',
                    'lens' => 'Laravel 13 & React',
                    'shutter' => '99.8% Uptime',
                    'aperture' => 'Lighthouse 99',
                    'iso' => 'PostgreSQL',
                ],
                [
                    'title' => 'Website Profile Perusahaan Korporat Modern',
                    'slug' => 'website-profile-perusahaan-korporat-modern',
                    'category' => 'corporate',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Corporate Branding',
                    'lens' => 'Bento 3D Grid',
                    'shutter' => 'Dual Theme Mode',
                    'aperture' => 'SEO Rank #1',
                    'iso' => 'Speed < 1s',
                ],
                [
                    'title' => 'EduSmart: Portal Pendidikan, Absensi & Akademik',
                    'slug' => 'edusmart-portal-pendidikan-absensi-akademik',
                    'category' => 'edtech',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'EdTech Architecture',
                    'lens' => 'QR Presensi Gateway',
                    'shutter' => 'WA Notification',
                    'aperture' => 'E-Raport Cloud',
                    'iso' => 'MySQL Cluster',
                ],
                [
                    'title' => 'E-Commerce Marketplace & Sistem Booking',
                    'slug' => 'ecommerce-marketplace-sistem-booking',
                    'category' => 'ecommerce',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Digital Retail Hub',
                    'lens' => 'Midtrans QRIS & VA',
                    'shutter' => 'Ongkir Realtime',
                    'aperture' => 'Instant Checkout',
                    'iso' => 'PCI-DSS',
                ],
            ],
            'computer-service' => [
                [
                    'title' => 'Installasi Software (OS & Aplikasi)',
                    'slug' => 'installasi-software-os-aplikasi',
                    'category' => 'software',
                    'file_webp_path' => '/images/services/service_software.jpg',
                    'camera' => 'Clean OS Lab',
                    'lens' => 'Windows 11 & macOS',
                    'shutter' => '1 - 2 Jam Selesai',
                    'aperture' => 'Bebas Bloatware',
                    'iso' => 'Lisensi Resmi',
                ],
                [
                    'title' => 'Upgrade SSD (Speed Boost 10x)',
                    'slug' => 'upgrade-ssd-speed-boost',
                    'category' => 'hardware',
                    'file_webp_path' => '/images/services/service_ssd.jpg',
                    'camera' => 'Speed Boost Lab',
                    'lens' => 'NVMe PCIe Gen4 M.2',
                    'shutter' => '7000 MB/s Speed',
                    'aperture' => 'Kloning Data 100%',
                    'iso' => 'Garansi 3-5 Tahun',
                ],
                [
                    'title' => 'Rakit PC Custom Build (Custom Rig & Tuning)',
                    'slug' => 'rakit-pc-custom-build-tuning',
                    'category' => 'custom_pc',
                    'file_webp_path' => '/images/services/service_pc.jpg',
                    'camera' => 'Precision Assembly',
                    'lens' => 'Thermal Paste PTM7950',
                    'shutter' => 'Stress Test 3DMark',
                    'aperture' => 'Cable Management Rapi',
                    'iso' => 'Update BIOS UEFI',
                ],
                [
                    'title' => 'Penggantian Part (Sparepart Original)',
                    'slug' => 'penggantian-part-sparepart-original',
                    'category' => 'sparepart',
                    'file_webp_path' => '/images/services/service_part.jpg',
                    'camera' => 'Component Lab',
                    'lens' => 'Panel LCD IPS Original',
                    'shutter' => 'Baterai Baru Cycle 0',
                    'aperture' => 'Keyboard & Engsel',
                    'iso' => 'Garansi Resmi Toko',
                ],
            ],
            'sewa-alat' => [
                [
                    'title' => 'Proyektor Epson EB-E01 3300 Lumens 3LCD',
                    'slug' => 'proyektor-epson-eb-e01-3300-lumens',
                    'category' => 'proyektor',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Rental Gear Lab',
                    'lens' => '3300 ANSI Lumens',
                    'shutter' => '3LCD Technology',
                    'aperture' => 'HDMI Cable 10m',
                    'iso' => 'Ready Stock',
                ],
                [
                    'title' => 'Proyektor Laser ViewSonic 4K UHD 5000 Lumens',
                    'slug' => 'proyektor-laser-viewsonic-4k-5000-lumens',
                    'category' => 'proyektor',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Rental Gear Lab',
                    'lens' => '5000 ANSI Lumens',
                    'shutter' => 'True 4K UHD Laser',
                    'aperture' => 'Auditorium & Expo',
                    'iso' => 'Ultra Bright',
                ],
                [
                    'title' => 'Screen Layar Proyektor Tripod 84 Inch',
                    'slug' => 'screen-layar-proyektor-tripod-84-inch',
                    'category' => 'proyektor',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Rental Gear Lab',
                    'lens' => '178 x 178 cm',
                    'shutter' => 'Tripod Portable Kokoh',
                    'aperture' => 'Matte White High Contrast',
                    'iso' => 'Mudah Dibawa',
                ],
                [
                    'title' => 'Smart TV 55 Inch 4K UHD + Standing Bracket',
                    'slug' => 'smart-tv-55-inch-4k-standing-bracket',
                    'category' => 'tv',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Rental Gear Lab',
                    'lens' => 'Crystal 4K UHD Display',
                    'shutter' => 'Wireless Screen Mirroring',
                    'aperture' => 'Standing Bracket Beroda',
                    'iso' => 'Exhibition Ready',
                ],
                [
                    'title' => 'Smart TV 65 Inch 4K HDR + Heavy Duty Standing Display',
                    'slug' => 'smart-tv-65-inch-4k-hdr-heavy-duty',
                    'category' => 'tv',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Rental Gear Lab',
                    'lens' => '65 Inch Ultra Vivid HDR',
                    'shutter' => 'Dolby Atmos Audio',
                    'aperture' => 'Heavy Duty Floor Stand 1.8m',
                    'iso' => 'Booth Pameran & Event',
                ],
                [
                    'title' => 'DJI Mavic 3 Pro Cine Drone Kit (Triple Camera 4K/5.1K)',
                    'slug' => 'dji-mavic-3-pro-cine-kit',
                    'category' => 'drone',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'DJI Mavic 3 Pro Cine',
                    'lens' => 'Hasselblad 4/3 CMOS + 70mm + 166mm',
                    'shutter' => 'Apple ProRes 422 HQ 5.1K',
                    'aperture' => 'DJI RC Pro + 3 Baterai',
                    'iso' => 'ND Filter Kit',
                ],
                [
                    'title' => 'DJI Mini 4 Pro Fly More Combo',
                    'slug' => 'dji-mini-4-pro-fly-more-combo',
                    'category' => 'drone',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'DJI Mini 4 Pro',
                    'lens' => '4K 60fps HDR True Vertical',
                    'shutter' => '< 249g Ultralight',
                    'aperture' => 'Omnidirectional Sensing',
                    'iso' => '3x Intelligent Flight Battery',
                ],
            ],
            'langit-education' => [
                [
                    'title' => 'Kursus Coding (Robotik, Web Dev & AI)',
                    'slug' => 'kursus-coding-robotik-web-ai-showcase',
                    'category' => 'coding',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Workstation Studio Lab',
                    'lens' => 'Python, React & ESP32 IoT',
                    'shutter' => '10 Minggu (30 Pertemuan)',
                    'aperture' => 'Capstone Web & AI Otomasi',
                    'iso' => 'Mentor Rian Hidayat',
                ],
                [
                    'title' => 'Kursus Office (Microsoft Office & Google Workspace)',
                    'slug' => 'kursus-office-profesional-showcase',
                    'category' => 'office',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Office Command Lab',
                    'lens' => 'Word, Excel Advanced, PPT & Cloud',
                    'shutter' => '6 Minggu (18 Pertemuan)',
                    'aperture' => 'XLOOKUP & Dashboard Eksekutif',
                    'iso' => 'Mentor Siti Nurhaliza',
                ],
                [
                    'title' => 'Kursus Rakit Komputer & Hardware Lab',
                    'slug' => 'kursus-rakit-komputer-hardware-showcase',
                    'category' => 'hardware',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Hardware Diagnostic Lab',
                    'lens' => 'ESD Safe Workbench & Soldering',
                    'shutter' => '4 Minggu (12 Pertemuan)',
                    'aperture' => 'Custom Assembly & BIOS UEFI',
                    'iso' => 'Mentor Agus Prasetyo',
                ],
            ],
            'internship' => [
                [
                    'title' => 'Posisi Magang: Videographer (Cinema & Visual Shoot)',
                    'slug' => 'posisi-magang-videographer',
                    'category' => 'onsite',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Sony FX3 Cinema Line',
                    'lens' => 'FE 24-70mm F2.8 GM II',
                    'shutter' => 'Durasi: 4 Bulan (Onsite)',
                    'aperture' => 'Kuota: 2 Orang',
                    'iso' => 'Divisi Photo & Video',
                ],
                [
                    'title' => 'Posisi Magang: Talent / Model (Commercial & Creative)',
                    'slug' => 'posisi-magang-talent-model',
                    'category' => 'onsite',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Sony A7R V',
                    'lens' => 'FE 85mm F1.4 GM',
                    'shutter' => 'Durasi: 3 Bulan (Onsite)',
                    'aperture' => 'Kuota: 2 Orang',
                    'iso' => 'Divisi Creative & Visual',
                ],
                [
                    'title' => 'Posisi Magang: Video Editor (Post-Production & Grading)',
                    'slug' => 'posisi-magang-video-editor',
                    'category' => 'hybrid',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'DaVinci Resolve & Premiere',
                    'lens' => 'Dual Screen 4K Color Grading',
                    'shutter' => 'Durasi: 4 Bulan (Hybrid)',
                    'aperture' => 'Kuota: 2 Orang',
                    'iso' => 'Divisi Post-Production',
                ],
                [
                    'title' => 'Posisi Magang: Web Developer (Modern React & Laravel)',
                    'slug' => 'posisi-magang-web-developer',
                    'category' => 'hybrid',
                    'file_webp_path' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
                    'camera' => 'Engineering Hub',
                    'lens' => 'Laravel 13 & React SPA',
                    'shutter' => 'Durasi: 4 Bulan (Hybrid)',
                    'aperture' => 'Kuota: 2 Orang',
                    'iso' => 'Divisi Web Development',
                ],
            ],
        ];

        foreach ($seedSamples as $slug => $items) {
            $serviceId = $serviceMap[$slug] ?? null;
            if (! $serviceId) {
                continue;
            }

            $existingCount = Gallery::where('service_id', $serviceId)->count();
            if ($existingCount === 0) {
                foreach ($items as $item) {
                    Gallery::create([
                        'service_id' => $serviceId,
                        'title' => $item['title'],
                        'slug' => $item['slug'].'-'.substr(md5(uniqid()), 0, 6),
                        'category' => $item['category'],
                        'media_type' => 'photo',
                        'file_webp_path' => $item['file_webp_path'],
                        'exif_metadata_json' => [
                            'camera' => $item['camera'],
                            'lens' => $item['lens'],
                            'shutter' => $item['shutter'],
                            'aperture' => $item['aperture'],
                            'iso' => $item['iso'],
                        ],
                        'is_featured' => true,
                    ]);
                }
            }
        }
    }

    /**
     * Update Service (Card Photo, Description, Colors, Badges, etc.)
     */
    public function updateService(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|string',
            'file_photo' => 'nullable|file|mimes:jpeg,png,webp,jpg,gif|max:10240',
            'accent_color' => 'nullable|string|max:50',
            'vip_label' => 'nullable|string|max:100',
            'ribbon_text' => 'nullable|string|max:50',
            'serial_number' => 'nullable|string|max:50',
            'tags' => 'nullable',
            'is_active' => 'nullable|boolean',
        ]);

        $imageUrl = ! empty($validated['image_url']) ? $validated['image_url'] : $service->image_url;

        if ($request->hasFile('file_photo')) {
            $file = $request->file('file_photo');
            $dest = public_path('uploads/services');
            if (! file_exists($dest)) {
                mkdir($dest, 0755, true);
            }
            $filename = 'service_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $file->move($dest, $filename);
            $imageUrl = '/uploads/services/'.$filename;
        }

        // Parse tags if sent as string or array
        $tags = $validated['tags'] ?? $service->tags;
        if (is_string($tags)) {
            $tags = array_values(array_filter(array_map('trim', explode(',', $tags))));
        }

        $service->update([
            'name' => $validated['name'],
            'tagline' => $validated['tagline'] ?? $service->tagline,
            'description' => $validated['description'],
            'image_url' => $imageUrl,
            'accent_color' => $validated['accent_color'] ?? $service->accent_color,
            'vip_label' => $validated['vip_label'] ?? $service->vip_label,
            'ribbon_text' => $validated['ribbon_text'] ?? $service->ribbon_text,
            'serial_number' => $validated['serial_number'] ?? $service->serial_number,
            'tags' => $tags,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $service->is_active,
        ]);

        return back()->with('success', 'Divisi Layanan "'.$service->name.'" berhasil diperbarui.');
    }
}
