<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('ai_photos')) {
            Schema::create('ai_photos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('uploaded_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('title')->nullable();
                $table->string('original_filename');
                $table->string('original_file_path');
                $table->string('preview_watermarked_path');
                $table->unsignedInteger('original_width')->default(0);
                $table->unsignedInteger('original_height')->default(0);
                $table->unsignedBigInteger('original_size_bytes')->default(0);
                $table->unsignedBigInteger('preview_size_bytes')->default(0);
                $table->decimal('price', 12, 2)->default(25000);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'whatsapp_number')) {
                $table->string('whatsapp_number', 30)->nullable()->after('phone');
            }
            if (! Schema::hasColumn('users', 'free_photo_quota')) {
                $table->unsignedInteger('free_photo_quota')->default(1)->after('role');
            }
            if (! Schema::hasColumn('users', 'free_photo_used_at')) {
                $table->timestamp('free_photo_used_at')->nullable()->after('free_photo_quota');
            }
            if (! Schema::hasColumn('users', 'free_photo_id')) {
                $table->foreignId('free_photo_id')->nullable()->after('free_photo_used_at')->constrained('ai_photos')->nullOnDelete();
            }
        });

        if (! Schema::hasTable('ai_photo_faces')) {
            Schema::create('ai_photo_faces', function (Blueprint $table) {
                $table->id();
                $table->foreignId('photo_id')->constrained('ai_photos')->cascadeOnDelete();
                $table->longText('face_embedding');
                $table->json('bounding_box')->nullable();
                $table->float('confidence_score')->default(0.95);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ai_face_scans')) {
            Schema::create('ai_face_scans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
                $table->longText('selected_face_embedding')->nullable();
                $table->json('selected_box')->nullable();
                $table->json('matched_photo_ids')->nullable();
                $table->timestamp('scanned_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ai_discount_rules')) {
            Schema::create('ai_discount_rules', function (Blueprint $table) {
                $table->id();
                $table->string('name')->default('Diskon Paket Foto');
                $table->unsignedInteger('min_photos_selected')->default(5);
                $table->decimal('discount_percentage', 5, 2)->default(20);
                $table->decimal('default_photo_price', 12, 2)->default(25000);
                $table->string('admin_whatsapp')->default('6281234567890');
                $table->text('manual_payment_info')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ai_photo_requests')) {
            Schema::create('ai_photo_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_code')->unique();
                $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedInteger('total_selected_photos')->default(0);
                $table->decimal('subtotal_price', 12, 2)->default(0);
                $table->decimal('discount_percentage_applied', 5, 2)->default(0);
                $table->decimal('discount_amount', 12, 2)->default(0);
                $table->decimal('total_final_price', 12, 2)->default(0);
                $table->enum('status', ['WAITING_MANUAL_PAYMENT', 'SENT_BY_ADMIN', 'CANCELLED'])->default('WAITING_MANUAL_PAYMENT');
                $table->text('customer_notes')->nullable();
                $table->text('admin_notes')->nullable();
                $table->timestamp('requested_at')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('ai_request_items')) {
            Schema::create('ai_request_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('ai_photo_requests')->cascadeOnDelete();
                $table->foreignId('photo_id')->constrained('ai_photos')->cascadeOnDelete();
                $table->decimal('price_at_request', 12, 2)->default(0);
                $table->boolean('is_original_unlocked')->default(false);
                $table->string('delivered_original_file_path')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_request_items');
        Schema::dropIfExists('ai_photo_requests');
        Schema::dropIfExists('ai_discount_rules');
        Schema::dropIfExists('ai_face_scans');
        Schema::dropIfExists('ai_photo_faces');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'free_photo_id')) {
                $table->dropConstrainedForeignId('free_photo_id');
            }
            $cols = array_filter(['whatsapp_number', 'free_photo_quota', 'free_photo_used_at'], fn ($c) => Schema::hasColumn('users', $c));
            if (! empty($cols)) {
                $table->dropColumn($cols);
            }
        });

        Schema::dropIfExists('ai_photos');
    }
};
