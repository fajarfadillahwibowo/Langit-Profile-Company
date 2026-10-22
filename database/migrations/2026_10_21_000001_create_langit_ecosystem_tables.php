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
        // 1. Services
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->string('accent_color')->default('#0EA5E9');
            $table->text('icon_svg')->nullable();
            $table->json('hero_config_json')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Galleries (Langit Photo & Video Gallery)
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('commercial'); // wedding, commercial, product, drone, event
            $table->string('media_type')->default('photo'); // photo, video, before_after
            $table->string('file_webp_path');
            $table->string('before_file_path')->nullable();
            $table->string('video_url')->nullable();
            $table->json('exif_metadata_json')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // 3. Web Portfolios
        Schema::create('web_portfolios', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client_name');
            $table->string('project_url')->nullable();
            $table->string('desktop_preview_img')->nullable();
            $table->string('mobile_preview_img')->nullable();
            $table->json('tech_stack_json')->nullable();
            $table->integer('lighthouse_score')->default(95);
            $table->text('challenge_text')->nullable();
            $table->text('solution_text')->nullable();
            $table->timestamps();
        });

        // 4. Web Estimator Components
        Schema::create('web_estimator_components', function (Blueprint $table) {
            $table->id();
            $table->string('component_name');
            $table->string('category');
            $table->decimal('base_price', 12, 2);
            $table->integer('estimated_days')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Education Courses
        Schema::create('education_courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('level')->default('beginner'); // beginner, intermediate, advanced
            $table->string('duration_text');
            $table->decimal('price', 12, 2);
            $table->integer('quota')->default(15);
            $table->json('syllabus_json')->nullable();
            $table->string('mentor_name');
            $table->string('mentor_role');
            $table->boolean('is_open')->default(true);
            $table->timestamps();
        });

        // 6. Education Registrations
        Schema::create('education_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('education_courses')->cascadeOnDelete();
            $table->string('student_name');
            $table->string('email');
            $table->string('whatsapp');
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, completed
            $table->timestamps();
        });

        // 7. Computer Service Tickets
        Schema::create('computer_service_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique(); // e.g. SRV-2026-0089
            $table->string('customer_name');
            $table->string('whatsapp');
            $table->string('device_type'); // Laptop, PC Rakitan, MacBook
            $table->string('device_brand_model');
            $table->text('problem_reported');
            $table->text('diagnosis_result')->nullable();
            $table->string('status')->default('received'); // received, waiting_part, repairing, qc_testing, ready, completed
            $table->decimal('estimated_cost', 12, 2)->default(0);
            $table->decimal('final_cost', 12, 2)->nullable();
            $table->timestamps();
        });

        // 8. Rental Equipments
        Schema::create('rental_equipments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('brand');
            $table->string('category'); // camera, lens, lighting, audio, stabilizer, drone, other
            $table->decimal('price_per_day', 12, 2);
            $table->integer('stock_total')->default(1);
            $table->integer('stock_available')->default(1);
            $table->string('thumbnail_webp')->nullable();
            $table->json('specs_json')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 9. Rental Bookings
        Schema::create('rental_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique(); // e.g. RNT-2026-001
            $table->string('customer_name');
            $table->string('whatsapp');
            $table->string('identity_card_type')->default('KTP');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days')->default(1);
            $table->json('rented_items_json');
            $table->decimal('total_price', 12, 2);
            $table->string('status')->default('pending'); // pending, approved, picked_up, returned, cancelled
            $table->timestamps();
        });

        // 10. Internship Positions
        Schema::create('internship_positions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('division_name');
            $table->string('work_type')->default('hybrid'); // onsite, hybrid, remote
            $table->integer('quota')->default(2);
            $table->integer('duration_months')->default(3);
            $table->json('requirements_json')->nullable();
            $table->json('benefits_json')->nullable();
            $table->boolean('is_open')->default(true);
            $table->timestamps();
        });

        // 11. Internship Applications
        Schema::create('internship_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('position_id')->constrained('internship_positions')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('institution_name');
            $table->string('major');
            $table->string('email');
            $table->string('whatsapp');
            $table->string('cv_pdf_path')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->text('motivation_letter')->nullable();
            $table->string('status')->default('submitted'); // submitted, reviewed, interview, accepted, rejected
            $table->timestamps();
        });

        // 12. Collaborations
        Schema::create('collaborations', function (Blueprint $table) {
            $table->id();
            $table->string('organization_name');
            $table->string('pic_name');
            $table->string('email');
            $table->string('whatsapp');
            $table->string('collab_type')->default('media_partner'); // media_partner, sponsorship, campus_visit, b2b_project, other
            $table->date('event_date')->nullable();
            $table->string('proposal_pdf_path')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('new'); // new, in_discussion, approved, declined
            $table->timestamps();
        });

        // 13. Consultations
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique(); // e.g. CNS-2026-001
            $table->string('client_name');
            $table->string('company_or_institution')->nullable();
            $table->string('whatsapp');
            $table->string('email')->nullable();
            $table->string('service_topic');
            $table->string('meeting_method')->default('online_meet'); // online_meet, offline_studio
            $table->date('preferred_date');
            $table->string('preferred_time');
            $table->text('project_brief')->nullable();
            $table->string('budget_estimation')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, completed, rescheduled, cancelled
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
        Schema::dropIfExists('collaborations');
        Schema::dropIfExists('internship_applications');
        Schema::dropIfExists('internship_positions');
        Schema::dropIfExists('rental_bookings');
        Schema::dropIfExists('rental_equipments');
        Schema::dropIfExists('computer_service_tickets');
        Schema::dropIfExists('education_registrations');
        Schema::dropIfExists('education_courses');
        Schema::dropIfExists('web_estimator_components');
        Schema::dropIfExists('web_portfolios');
        Schema::dropIfExists('galleries');
        Schema::dropIfExists('services');
    }
};
