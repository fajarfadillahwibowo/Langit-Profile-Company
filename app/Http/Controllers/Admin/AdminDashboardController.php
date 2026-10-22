<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Gallery;
use App\Models\WebPortfolio;
use App\Models\WebEstimatorComponent;
use App\Models\EducationCourse;
use App\Models\EducationRegistration;
use App\Models\ComputerServiceTicket;
use App\Models\RentalEquipment;
use App\Models\RentalBooking;
use App\Models\InternshipPosition;
use App\Models\InternshipApplication;
use App\Models\Collaboration;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

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

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recentConsultations' => Consultation::latest()->take(5)->get(),
            'serviceTickets' => ComputerServiceTicket::latest()->take(10)->get(),
            'rentalBookings' => RentalBooking::latest()->take(10)->get(),
            'internshipApplications' => InternshipApplication::with('position')->latest()->take(10)->get(),
            'collaborations' => Collaboration::latest()->get(),
            'galleries' => Gallery::latest()->take(12)->get(),
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

        return back()->with('success', "Status tiket {$ticket->receipt_number} berhasil diperbarui ke " . strtoupper($ticket->status));
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

        $receiptNumber = 'SRV-' . date('Y') . '-' . str_pad(ComputerServiceTicket::count() + 1, 4, '0', STR_PAD_LEFT);

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
            'category' => 'required|string|in:wedding,commercial,product,drone,event',
            'media_type' => 'required|string|in:photo,video,before_after',
            'file_webp_path' => 'required|string',
            'before_file_path' => 'nullable|string',
            'camera' => 'nullable|string',
            'lens' => 'nullable|string',
            'shutter' => 'nullable|string',
            'aperture' => 'nullable|string',
            'iso' => 'nullable|string',
        ]);

        Gallery::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . time(),
            'category' => $validated['category'],
            'media_type' => $validated['media_type'],
            'file_webp_path' => $validated['file_webp_path'],
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

        return back()->with('success', "Item galeri baru berhasil ditambahkan!");
    }

    /**
     * Delete Gallery Item
     */
    public function deleteGallery($id)
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->delete();

        return back()->with('success', "Item galeri dihapus.");
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

        return back()->with('success', "Proposal kerja sama berhasil dihapus.");
    }
}
