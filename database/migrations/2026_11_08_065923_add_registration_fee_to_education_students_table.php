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
        Schema::table('education_students', function (Blueprint $table) {
            $table->decimal('registration_fee', 12, 2)->default(50000)->after('fee_per_cycle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('education_students', function (Blueprint $table) {
            $table->dropColumn('registration_fee');
        });
    }
};
