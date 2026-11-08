<?php

namespace Tests\Feature;

use App\Models\EducationAttendance;
use App\Models\EducationPayment;
use App\Models\EducationStudent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EducationAttendanceTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
        ]);
    }

    public function test_non_admin_cannot_access_education_attendance_endpoints(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user)
            ->post('/admin/education-students', [
                'name' => 'Budi Santoso',
                'category' => 'Coding & Robotik',
                'whatsapp' => '081234567890',
                'fee_per_cycle' => 600000,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_create_student_with_custom_category_and_fee(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->post('/admin/education-students', [
            'name' => 'Alvaro Narendra',
            'category' => 'Coding & Robotik (AI & Python)',
            'parent_name' => 'Hendra Narendra',
            'whatsapp' => '082155667788',
            'fee_per_cycle' => 750000,
            'joined_at' => '2026-11-01',
            'notes' => 'Minat pada pembuatan game dan robotik ESP32.',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('education_students', [
            'name' => 'Alvaro Narendra',
            'category' => 'Coding & Robotik (AI & Python)',
            'fee_per_cycle' => 750000,
        ]);
    }

    public function test_attendance_records_increment_meeting_and_cycle_numbers_accurately(): void
    {
        $admin = $this->createAdmin();

        $student = EducationStudent::create([
            'name' => 'Kezia Aurelia',
            'category' => 'Microsoft Office & Administrasi',
            'whatsapp' => '081299887766',
            'fee_per_cycle' => 600000,
        ]);

        // Input sesi 1
        $this->actingAs($admin)->post('/admin/education-attendance', [
            'student_id' => $student->id,
            'date' => '2026-11-02',
            'status' => 'hadir',
            'topic' => 'Word: Surat & Format Dokumen Resmi',
            'mentor_name' => 'Instruktur Office',
        ])->assertSessionHasNoErrors()->assertRedirect();

        $att1 = EducationAttendance::where('student_id', $student->id)->where('meeting_number', 1)->first();
        $this->assertNotNull($att1);
        $this->assertSame(1, $att1->cycle_number);
        $this->assertSame(1, $att1->session_in_cycle);

        // Input 7 sesi berikutnya hingga genap 8 sesi (Siklus 1 penuh)
        for ($i = 2; $i <= 8; $i++) {
            $this->actingAs($admin)->post('/admin/education-attendance', [
                'student_id' => $student->id,
                'date' => '2026-11-0' . $i,
                'status' => 'hadir',
                'topic' => 'Materi Pertemuan Ke-' . $i,
            ])->assertSessionHasNoErrors();
        }

        $this->assertSame(8, $student->fresh()->total_meetings);
        $this->assertSame(1, $student->fresh()->current_cycle);
        $this->assertSame(8, $student->fresh()->session_in_cycle);
        $this->assertTrue($student->fresh()->is_cycle_completed);
    }

    public function test_attendance_for_session_9_is_not_locked_even_if_payment_is_unpaid(): void
    {
        // ATURAN KRUSIAL: Setiap 8 kali pertemuan harus bayar tapi opsional bisa absen selanjutnya tidak terkunci
        $admin = $this->createAdmin();

        $student = EducationStudent::create([
            'name' => 'Farel Bintang',
            'category' => 'Hardware & Perakitan Komputer',
            'whatsapp' => '085211223344',
            'fee_per_cycle' => 650000,
        ]);

        // Rekam 8 sesi tanpa bayar
        for ($i = 1; $i <= 8; $i++) {
            EducationAttendance::create([
                'student_id' => $student->id,
                'meeting_number' => $i,
                'cycle_number' => 1,
                'session_in_cycle' => $i,
                'date' => '2026-11-01',
                'status' => 'hadir',
                'topic' => 'Hardware Lab Sesi ' . $i,
            ]);
        }

        // Siswa sudah 8 sesi dan belum bayar Siklus 2.
        // Verifikasi admin TETAP BISA INPUT ABSEN KE-9 dan TIDAK TERKUNCI!
        $response = $this->actingAs($admin)->post('/admin/education-attendance', [
            'student_id' => $student->id,
            'date' => '2026-11-09',
            'status' => 'hadir',
            'topic' => 'Troubleshooting BIOS & Instalasi Driver (Sesi Baru)',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $att9 = EducationAttendance::where('student_id', $student->id)->where('meeting_number', 9)->first();
        $this->assertNotNull($att9);
        $this->assertSame(2, $att9->cycle_number);
        $this->assertSame(1, $att9->session_in_cycle);

        $this->assertSame(9, $student->fresh()->total_meetings);
        $this->assertSame(2, $student->fresh()->current_cycle);
        $this->assertSame(1, $student->fresh()->session_in_cycle);
    }

    public function test_admin_can_record_payment_and_receipt_is_generated(): void
    {
        $admin = $this->createAdmin();

        $student = EducationStudent::create([
            'name' => 'Dimas Rizky',
            'category' => 'Web Development',
            'whatsapp' => '081377889900',
            'fee_per_cycle' => 800000,
        ]);

        // Bayar Siklus 1
        $response = $this->actingAs($admin)->post('/admin/education-payments', [
            'student_id' => $student->id,
            'cycle_number' => 1,
            'amount' => 800000,
            'payment_date' => '2026-11-05',
            'payment_method' => 'transfer',
            'notes' => 'Transfer via BCA an Orang Tua',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $payment = EducationPayment::where('student_id', $student->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame(800000.0, (float) $payment->amount);
        $this->assertStringStartsWith('INV-EDU-', $payment->receipt_number);
        $this->assertSame(1, $payment->cycle_number);
        $this->assertContains(1, $student->fresh()->paid_cycles);
    }

    public function test_dashboard_renders_education_students_and_financial_metrics(): void
    {
        $admin = $this->createAdmin();

        $student = EducationStudent::create([
            'name' => 'Nayla Syakira',
            'category' => 'Desain Grafis & Multimedia',
            'whatsapp' => '081234000111',
            'fee_per_cycle' => 500000,
        ]);

        EducationPayment::create([
            'student_id' => $student->id,
            'cycle_number' => 1,
            'amount' => 500000,
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
            'receipt_number' => 'INV-EDU-202611-0099',
            'status' => 'paid',
        ]);

        $this->actingAs($admin)->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->has('educationStudents')
                ->has('educationFinancials')
                ->where('educationFinancials.total_income', 500000)
            );
    }

    public function test_admin_can_update_and_delete_attendance_and_student(): void
    {
        $admin = $this->createAdmin();

        $student = EducationStudent::create([
            'name' => 'Rangga Pratama',
            'category' => 'Coding & Robotik',
            'whatsapp' => '089912345678',
            'fee_per_cycle' => 700000,
        ]);

        $att = EducationAttendance::create([
            'student_id' => $student->id,
            'meeting_number' => 1,
            'cycle_number' => 1,
            'session_in_cycle' => 1,
            'date' => '2026-11-01',
            'status' => 'hadir',
            'topic' => 'Python Basics',
        ]);

        $this->actingAs($admin)->put('/admin/education-attendance/' . $att->id, [
            'date' => '2026-11-03',
            'status' => 'izin',
            'topic' => 'Python Basics (Izin, kirim modul)',
        ])->assertSessionHasNoErrors()->assertRedirect();

        $this->assertSame('izin', $att->fresh()->status);
        $this->assertSame('2026-11-03', $att->fresh()->date->format('Y-m-d'));

        // Delete attendance
        $this->actingAs($admin)->delete('/admin/education-attendance/' . $att->id)
            ->assertRedirect();
        $this->assertDatabaseMissing('education_attendances', ['id' => $att->id]);

        // Update student
        $this->actingAs($admin)->put('/admin/education-students/' . $student->id, [
            'name' => 'Rangga Pratama M.Sc',
            'category' => 'Advanced Robotics',
            'whatsapp' => '089912345678',
            'fee_per_cycle' => 900000,
            'status' => 'active',
        ])->assertSessionHasNoErrors()->assertRedirect();

        $this->assertSame('Rangga Pratama M.Sc', $student->fresh()->name);
        $this->assertSame('Advanced Robotics', $student->fresh()->category);

        // Delete student
        $this->actingAs($admin)->delete('/admin/education-students/' . $student->id)
            ->assertRedirect();
        $this->assertDatabaseMissing('education_students', ['id' => $student->id]);
    }

    public function test_student_auto_advances_to_new_cycle_after_8_sessions_without_locking(): void
    {
        $admin = $this->createAdmin();

        $student = EducationStudent::create([
            'name' => 'Kezia Aurelia',
            'category' => 'Microsoft Office & Administrasi',
            'whatsapp' => '081299887766',
            'fee_per_cycle' => 600000,
        ]);

        // Rekam 8 sesi lengkap Siklus 1
        for ($i = 1; $i <= 8; $i++) {
            EducationAttendance::create([
                'student_id' => $student->id,
                'meeting_number' => $i,
                'cycle_number' => 1,
                'session_in_cycle' => $i,
                'date' => '2026-11-0' . $i,
                'status' => 'hadir',
                'topic' => 'Topik ' . $i,
            ]);
        }

        $fresh = $student->fresh();
        $this->assertSame(8, $fresh->total_meetings);
        // Active cycle for taking next attendance is Cycle 2!
        $this->assertSame(2, $fresh->active_cycle);
        $this->assertSame(9, $fresh->next_meeting_number);

        // Rekam sesi ke-9 (Siklus 2 sesi 1) secara langsung tanpa terkunci
        $this->actingAs($admin)->post('/admin/education-attendance', [
            'student_id' => $student->id,
            'date' => '2026-11-10',
            'status' => 'hadir',
            'topic' => 'Sesi Baru Siklus 2',
        ])->assertSessionHasNoErrors()->assertRedirect();

        $att9 = EducationAttendance::where('student_id', $student->id)->where('meeting_number', 9)->first();
        $this->assertNotNull($att9);
        $this->assertSame(2, $att9->cycle_number);
        $this->assertSame(1, $att9->session_in_cycle);
        $this->assertSame(9, $student->fresh()->total_meetings);
        $this->assertSame(2, $student->fresh()->active_cycle);
        $this->assertSame(10, $student->fresh()->next_meeting_number);
    }
}
