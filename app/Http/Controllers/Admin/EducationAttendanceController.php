<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationAttendance;
use App\Models\EducationPayment;
use App\Models\EducationStudent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Str;

class EducationAttendanceController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [new Middleware(function (Request $request, \Closure $next) {
            abort_unless(in_array($request->user()?->role, ['admin', 'superadmin'], true), 403);

            return $next($request);
        })];
    }

    /**
     * Simpan data anak les / siswa baru
     */
    public function storeStudent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', 'max:100'],
            'parent_name' => ['nullable', 'string', 'max:120'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'fee_per_cycle' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:active,inactive,graduated'],
            'joined_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';
        $validated['joined_at'] = $validated['joined_at'] ?? now()->toDateString();

        $student = EducationStudent::create($validated);

        return back()->with('success', "Anak les {$student->name} ({$student->category}) berhasil didaftarkan.");
    }

    /**
     * Perbarui data anak les
     */
    public function updateStudent(Request $request, int $id): RedirectResponse
    {
        $student = EducationStudent::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', 'max:100'],
            'parent_name' => ['nullable', 'string', 'max:120'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'fee_per_cycle' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive,graduated'],
            'joined_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $student->update($validated);

        return back()->with('success', "Data anak les {$student->name} berhasil diperbarui.");
    }

    /**
     * Hapus data anak les beserta seluruh absensi & histori pembayaran
     */
    public function destroyStudent(int $id): RedirectResponse
    {
        $student = EducationStudent::findOrFail($id);
        $name = $student->name;
        $student->delete();

        return back()->with('success', "Data anak les {$name} dan seluruh riwayatnya berhasil dihapus.");
    }

    /**
     * Simpan absensi sesi pertemuan
     * Aturan bisnis: Setiap 8 pertemuan harus bayar, tapi opsional bisa absen selanjutnya tanpa kekunci.
     */
    public function storeAttendance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:education_students,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:hadir,izin,sakit,alpa'],
            'topic' => ['nullable', 'string', 'max:255'],
            'mentor_name' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'meeting_number' => ['nullable', 'integer', 'min:1'],
        ]);

        $student = EducationStudent::findOrFail($validated['student_id']);

        if (empty($validated['meeting_number'])) {
            $latestMeeting = (int) ($student->attendances()->max('meeting_number') ?? 0);
            $meetingNumber = $latestMeeting + 1;
        } else {
            $meetingNumber = (int) $validated['meeting_number'];
        }

        $cycleNumber = intdiv($meetingNumber - 1, 8) + 1;
        $sessionInCycle = (($meetingNumber - 1) % 8) + 1;

        EducationAttendance::create([
            'student_id' => $student->id,
            'meeting_number' => $meetingNumber,
            'cycle_number' => $cycleNumber,
            'session_in_cycle' => $sessionInCycle,
            'date' => $validated['date'],
            'status' => $validated['status'],
            'topic' => $validated['topic'] ?? null,
            'mentor_name' => $validated['mentor_name'] ?? 'Instruktur Langit Education',
            'notes' => $validated['notes'] ?? null,
        ]);

        $notice = "Absensi Pertemuan ke-{$meetingNumber} (Siklus {$cycleNumber} - Sesi {$sessionInCycle}/8) untuk {$student->name} berhasil disimpan.";

        // Cek jika siswa baru saja melengkapi 8 sesi
        if ($sessionInCycle === 8) {
            $notice .= " Sesi ke-8 selesai! Paket siklus {$cycleNumber} telah lengkap (Siap ditagih untuk siklus berikutnya, absensi berikutnya tetap bebas tidak terkunci).";
        }

        return back()->with('success', $notice);
    }

    /**
     * Perbarui catatan absensi yang telah tersimpan
     */
    public function updateAttendance(Request $request, int $id): RedirectResponse
    {
        $attendance = EducationAttendance::findOrFail($id);

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'status' => ['required', 'in:hadir,izin,sakit,alpa'],
            'topic' => ['nullable', 'string', 'max:255'],
            'mentor_name' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $attendance->update($validated);

        return back()->with('success', "Absensi Pertemuan ke-{$attendance->meeting_number} berhasil diperbarui.");
    }

    /**
     * Hapus catatan absensi
     */
    public function destroyAttendance(int $id): RedirectResponse
    {
        $attendance = EducationAttendance::findOrFail($id);
        $meeting = $attendance->meeting_number;
        $attendance->delete();

        return back()->with('success', "Data absensi pertemuan ke-{$meeting} berhasil dihapus.");
    }

    /**
     * Catat pembayaran paket 8 pertemuan (Pemasukan Uang Langit Education)
     */
    public function storePayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:education_students,id'],
            'cycle_number' => ['required', 'integer', 'min:1'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'in:transfer,cash,qris'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $student = EducationStudent::findOrFail($validated['student_id']);

        // Generate receipt number e.g. INV-EDU-202611-0001
        $prefix = 'INV-EDU-'.date('Ym').'-';
        $countThisMonth = EducationPayment::where('receipt_number', 'like', $prefix.'%')->count();
        $receiptNumber = $prefix.str_pad($countThisMonth + 1, 4, '0', STR_PAD_LEFT);

        // Jika nomor sudah ada (misal ada collision), tambahkan random suffix
        if (EducationPayment::where('receipt_number', $receiptNumber)->exists()) {
            $receiptNumber = $prefix.str_pad($countThisMonth + 1, 4, '0', STR_PAD_LEFT).'-'.strtoupper(Str::random(3));
        }

        $payment = EducationPayment::create([
            'student_id' => $student->id,
            'cycle_number' => (int) $validated['cycle_number'],
            'amount' => (float) $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'payment_method' => $validated['payment_method'],
            'receipt_number' => $receiptNumber,
            'status' => 'paid',
            'notes' => $validated['notes'] ?? null,
        ]);

        $formatted = 'Rp '.number_format($payment->amount, 0, ',', '.');

        return back()->with('success', "Pembayaran {$formatted} untuk Siklus ke-{$payment->cycle_number} ({$student->name}) berhasil dicatat. No. Kuitansi: {$receiptNumber}.");
    }

    /**
     * Hapus catatan pembayaran
     */
    public function destroyPayment(int $id): RedirectResponse
    {
        $payment = EducationPayment::findOrFail($id);
        $receipt = $payment->receipt_number;
        $payment->delete();

        return back()->with('success', "Catatan pembayaran {$receipt} berhasil dihapus.");
    }
}
