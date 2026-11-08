<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('delivery_creations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_delivery_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('delivery_uploads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_delivery_id')->constrained()->cascadeOnDelete();
            $table->string('original_name');
            $table->unsignedBigInteger('size');
            $table->unsignedInteger('chunks');
            $table->foreignId('client_photo_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('delivery_uploads'); Schema::dropIfExists('delivery_creations'); }
};
