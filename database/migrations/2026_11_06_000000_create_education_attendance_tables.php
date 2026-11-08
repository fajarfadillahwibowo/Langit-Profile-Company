<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Data Anak Les / Siswa Langit Education
        Schema::create('education_students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // e.g. Coding & Robotik, Microsoft Office, Hardware Lab, Desain Grafis, dll.
            $table->string('parent_name')->nullable();
            $table->string('whatsapp');
            $table->decimal('fee_per_cycle', 12, 2)->default(600000); // Biaya per paket 8 sesi
            $table->unsignedInteger('cycle_sessions_count')->default(8); // Default 8 sesi per siklus
            $table->string('status')->default('active'); // active, inactive, graduated
            $table->date('joined_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Data Absensi / Pertemuan Les
        Schema::create('education_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('education_students')->cascadeOnDelete();
            $table->unsignedInteger('meeting_number'); // Pertemuan kumulatif ke-N (1, 2, ... 8, 9, 10...)
            $table->unsignedInteger('cycle_number'); // Siklus ke-N (1 untuk sesi 1-8, 2 untuk 9-16, dst)
            $table->unsignedInteger('session_in_cycle'); // Sesi ke-1 s/d 8 di dalam siklus
            $table->date('date');
            $table->string('status')->default('hadir'); // hadir, izin, sakit, alpa
            $table->string('topic')->nullable(); // Materi / pembahasan
            $table->string('mentor_name')->nullable(); // Instruktur / tentor
            $table->text('notes')->nullable(); // Catatan evaluasi
            $table->timestamps();

            $table->index(['student_id', 'meeting_number']);
            $table->index(['student_id', 'cycle_number']);
        });

        // 3. Data Kas / Pemasukan Uang Langit Education
        Schema::create('education_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('education_students')->cascadeOnDelete();
            $table->unsignedInteger('cycle_number'); // Siklus paket yang dibayar (1, 2, 3...)
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->string('payment_method')->default('transfer'); // transfer, cash, qris
            $table->string('receipt_number')->unique(); // e.g. INV-EDU-202611-0001
            $table->string('status')->default('paid'); // paid, pending
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'cycle_number']);
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_payments');
        Schema::dropIfExists('education_attendances');
        Schema::dropIfExists('education_students');
    }
};
