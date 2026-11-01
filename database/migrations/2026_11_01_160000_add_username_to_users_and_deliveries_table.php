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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }
        });

        Schema::table('client_deliveries', function (Blueprint $table) {
            if (!Schema::hasColumn('client_deliveries', 'client_username')) {
                $table->string('client_username')->nullable()->index()->after('client_name');
            }
            if (!Schema::hasColumn('client_deliveries', 'client_password_hint')) {
                $table->string('client_password_hint')->nullable()->after('client_username');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username')) {
                $table->dropColumn('username');
            }
        });

        Schema::table('client_deliveries', function (Blueprint $table) {
            if (Schema::hasColumn('client_deliveries', 'client_username')) {
                $table->dropColumn('client_username');
            }
            if (Schema::hasColumn('client_deliveries', 'client_password_hint')) {
                $table->dropColumn('client_password_hint');
            }
        });
    }
};
