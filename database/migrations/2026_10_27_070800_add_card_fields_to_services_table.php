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
        Schema::table('services', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('tagline');
            $table->text('description')->nullable()->after('image_url');
            $table->string('vip_label')->nullable()->after('accent_color');
            $table->string('ribbon_text')->nullable()->after('vip_label');
            $table->json('tags')->nullable()->after('ribbon_text');
            $table->string('serial_number')->nullable()->after('tags');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['image_url', 'description', 'vip_label', 'ribbon_text', 'tags', 'serial_number']);
        });
    }
};
