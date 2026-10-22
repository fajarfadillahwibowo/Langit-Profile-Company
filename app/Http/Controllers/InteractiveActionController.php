<?php

namespace App\Http\Controllers;

use App\Models\ComputerServiceTicket;
use App\Models\RentalBooking;
use App\Models\RentalEquipment;
use App\Models\InternshipApplication;
use App\Models\Collaboration;
use App\Models\Consultation;
use App\Models\EducationRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InteractiveActionController extends Controller
{
    /**
     * 1. Live Service Receipt Tracker (GET /api/service-tracker/{receipt_number})
     */
    public function serviceTracker($receipt_number)
    {
        $ticket = ComputerServiceTicket::where('receipt_number', trim($receipt_number))->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => "Nota servis dengan nomor [{$receipt_number}] tidak ditemukan. Mohon periksa kembali nomor nota Anda.",
            ], 404);
        }

        $stages = ['received', 'waiting_part', 'repairing', 'qc_testing', 'ready', 'completed'];
        $currentStageIndex = array_search($ticket->status, $stages);
        if ($currentStageIndex === false) {
            $currentStageIndex = 0;
        }

        return response()->json([
            'success' => true,
            'ticket' => $ticket,
            'currentStageIndex' => $currentStageIndex,
        ]);
    }

    /**
     * 2. Rental Equipment Booking Checkout (POST /sewa-alat/checkout)
     */
    public function rentalCheckout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'identity_card_type' => 'required|string|in:KTP,SIM,KTM',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'total_days' => 'required|integer|min:1',
            'rented_items' => 'required|array|min:1',
            'total_price' => 'required|numeric|min:0',
        ]);

        $bookingCode = 'RNT-' . date('Y') . '-' . strtoupper(Str::random(5));

        $booking = RentalBooking::create([
            'booking_code' => $bookingCode,
            'customer_name' => $validated['customer_name'],
            'whatsapp' => $validated['whatsapp'],
            'identity_card_type' => $validated['identity_card_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $validated['total_days'],
            'rented_items_json' => $validated['rented_items'],
            'total_price' => $validated['total_price'],
            'status' => 'pending',
        ]);

        // Generate WhatsApp confirmation message link
        $waItemsText = '';
        foreach ($validated['rented_items'] as $item) {
            $waItemsText .= "- {$item['name']} ({$item['qty']}x) @ Rp " . number_format($item['price'], 0, ',', '.') . "\n";
        }

        $waText = urlencode("Halo Admin Rental Langit,\nSaya ingin konfirmasi booking sewa alat:\n" .
            "Kode Booking: {$bookingCode}\n" .
            "Nama: {$validated['customer_name']}\n" .
            "Durasi: {$validated['total_days']} Hari ({$validated['start_date']} s/d {$validated['end_date']})\n" .
            "Item:\n{$waItemsText}" .
            "Total Biaya: Rp " . number_format($validated['total_price'], 0, ',', '.') . "\n" .
            "Jaminan ID: {$validated['identity_card_type']}\nTerima kasih!");

        $waLink = "https://wa.me/6281234567893?text={$waText}";

        return response()->json([
            'success' => true,
            'booking_code' => $bookingCode,
            'booking' => $booking,
            'wa_link' => $waLink,
        ]);
    }

    /**
     * 3. Internship Application (POST /internship/apply)
     */
    public function internshipApply(Request $request)
    {
        $validated = $request->validate([
            'position_id' => 'required|exists:internship_positions,id',
            'full_name' => 'required|string|max:255',
            'institution_name' => 'required|string|max:255',
            'major' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:50',
            'portfolio_url' => 'nullable|url|max:255',
            'motivation_letter' => 'nullable|string',
            'cv_file' => 'nullable|file|mimes:pdf|max:5120', // max 5MB as per PRD Section 9.2
        ]);

        $cvPath = null;
        if ($request->hasFile('cv_file')) {
            $file = $request->file('cv_file');
            $filename = 'cv_' . time() . '_' . Str::slug($validated['full_name']) . '.' . $file->getClientOriginalExtension();
            $cvPath = $file->storeAs('uploads/cvs', $filename, 'public');
        }

        $application = InternshipApplication::create([
            'position_id' => $validated['position_id'],
            'full_name' => $validated['full_name'],
            'institution_name' => $validated['institution_name'],
            'major' => $validated['major'],
            'email' => $validated['email'],
            'whatsapp' => $validated['whatsapp'],
            'portfolio_url' => $validated['portfolio_url'] ?? null,
            'motivation_letter' => $validated['motivation_letter'] ?? null,
            'cv_pdf_path' => $cvPath ? '/storage/' . $cvPath : null,
            'status' => 'submitted',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lamaran magang Anda berhasil dikirim! Tim Langit akan menghubungi Anda via WhatsApp atau Email untuk jadwal interview.',
            'application' => $application,
        ]);
    }

    /**
     * 4. Collaboration Proposal Submit (POST /kolaborasi/submit)
     */
    public function collaborationSubmit(Request $request)
    {
        $validated = $request->validate([
            'organization_name' => 'required|string|max:255',
            'pic_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:50',
            'collab_type' => 'required|string',
            'event_date' => 'nullable|date',
            'description' => 'required|string',
            'proposal_file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $proposalPath = null;
        if ($request->hasFile('proposal_file')) {
            $file = $request->file('proposal_file');
            $filename = 'proposal_' . time() . '_' . Str::slug($validated['organization_name']) . '.' . $file->getClientOriginalExtension();
            $proposalPath = $file->storeAs('uploads/proposals', $filename, 'public');
        }

        $collab = Collaboration::create([
            'organization_name' => $validated['organization_name'],
            'pic_name' => $validated['pic_name'],
            'email' => $validated['email'],
            'whatsapp' => $validated['whatsapp'],
            'collab_type' => $validated['collab_type'],
            'event_date' => $validated['event_date'] ?? null,
            'description' => $validated['description'],
            'proposal_pdf_path' => $proposalPath ? '/storage/' . $proposalPath : null,
            'status' => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan proposal kerja sama berhasil diterima! Kami akan meninjau dan merespon dalam 1-2 hari kerja.',
            'collaboration' => $collab,
        ]);
    }

    /**
     * 5. Consultation Wizard Booking (POST /konsultasi/book)
     */
    public function consultationBook(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'company_or_institution' => 'nullable|string|max:255',
            'whatsapp' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'service_topic' => 'required|string|max:255',
            'meeting_method' => 'required|string|in:online_meet,offline_studio',
            'preferred_date' => 'required|date',
            'preferred_time' => 'required|string',
            'project_brief' => 'nullable|string',
            'budget_estimation' => 'nullable|string',
        ]);

        $ticketCode = 'CNS-' . date('Y') . '-' . str_pad(Consultation::count() + 1, 3, '0', STR_PAD_LEFT);

        $consultation = Consultation::create([
            'ticket_code' => $ticketCode,
            'client_name' => $validated['client_name'],
            'company_or_institution' => $validated['company_or_institution'] ?? null,
            'whatsapp' => $validated['whatsapp'],
            'email' => $validated['email'] ?? null,
            'service_topic' => $validated['service_topic'],
            'meeting_method' => $validated['meeting_method'],
            'preferred_date' => $validated['preferred_date'],
            'preferred_time' => $validated['preferred_time'],
            'project_brief' => $validated['project_brief'] ?? null,
            'budget_estimation' => $validated['budget_estimation'] ?? null,
            'status' => 'scheduled',
        ]);

        $waMsg = urlencode("Halo Admin Langit, saya baru saja menjadwalkan konsultasi proyek:\n" .
            "No Tiket: {$ticketCode}\n" .
            "Nama: {$validated['client_name']}\n" .
            "Topik: {$validated['service_topic']}\n" .
            "Metode: " . ($validated['meeting_method'] === 'online_meet' ? 'Online (Google Meet)' : 'Tatap Muka di Studio Langit') . "\n" .
            "Jadwal: {$validated['preferred_date']} jam {$validated['preferred_time']}\nTerima kasih.");

        $waLink = "https://wa.me/6281234567890?text={$waMsg}";

        return response()->json([
            'success' => true,
            'ticket_code' => $ticketCode,
            'consultation' => $consultation,
            'wa_link' => $waLink,
        ]);
    }

    /**
     * 6. Course Registration (POST /education/register)
     */
    public function educationRegister(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:education_courses,id',
            'student_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $reg = EducationRegistration::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran kelas berhasil! Admin kami akan menghubungi via WhatsApp untuk konfirmasi grup kelas dan starter kit.',
            'registration' => $reg,
        ]);
    }
}
