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
        Schema::table('client_deliveries', function (Blueprint $table) {
            $table->decimal('raw_price_per_photo', 12, 2)->default(15000.00)->after('download_count');
            $table->string('raw_price_description')->default('Rp 15.000 / foto')->after('raw_price_per_photo');
            $table->decimal('raw_discount_5_percent', 5, 2)->default(10.00)->after('raw_price_description');
            $table->decimal('raw_discount_10_percent', 5, 2)->default(20.00)->after('raw_discount_5_percent');
            $table->text('raw_notes')->nullable()->after('raw_discount_10_percent');
        });

        Schema::create('client_raw_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_delivery_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('mime_type')->default('image/jpeg');
            $table->decimal('price', 12, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('client_raw_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_delivery_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('selected_photo_ids');
            $table->unsignedInteger('total_photos')->default(0);
            $table->decimal('price_per_photo', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, in_review, editing, completed, cancelled
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_raw_selections');
        Schema::dropIfExists('client_raw_photos');

        Schema::table('client_deliveries', function (Blueprint $table) {
            $table->dropColumn([
                'raw_price_per_photo',
                'raw_price_description',
                'raw_discount_5_percent',
                'raw_discount_10_percent',
                'raw_notes',
            ]);
        });
    }
};
