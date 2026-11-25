<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ai_discount_rules')) {
            Schema::table('ai_discount_rules', function (Blueprint $table) {
                if (! Schema::hasColumn('ai_discount_rules', 'qris_image_path')) {
                    $table->string('qris_image_path')->nullable()->after('manual_payment_info');
                }
                if (! Schema::hasColumn('ai_discount_rules', 'bank_name')) {
                    $table->string('bank_name', 100)->nullable()->after('qris_image_path');
                }
                if (! Schema::hasColumn('ai_discount_rules', 'bank_account_number')) {
                    $table->string('bank_account_number', 80)->nullable()->after('bank_name');
                }
                if (! Schema::hasColumn('ai_discount_rules', 'bank_account_holder')) {
                    $table->string('bank_account_holder', 150)->nullable()->after('bank_account_number');
                }
            });
        }

        if (Schema::hasTable('ai_photo_requests')) {
            Schema::table('ai_photo_requests', function (Blueprint $table) {
                if (! Schema::hasColumn('ai_photo_requests', 'payment_method')) {
                    $table->string('payment_method', 30)->nullable()->after('status');
                }
                if (! Schema::hasColumn('ai_photo_requests', 'payment_proof_path')) {
                    $table->string('payment_proof_path')->nullable()->after('payment_method');
                }
                if (! Schema::hasColumn('ai_photo_requests', 'payment_proof_original_name')) {
                    $table->string('payment_proof_original_name')->nullable()->after('payment_proof_path');
                }
                if (! Schema::hasColumn('ai_photo_requests', 'payment_proof_uploaded_at')) {
                    $table->timestamp('payment_proof_uploaded_at')->nullable()->after('payment_proof_original_name');
                }
                if (! Schema::hasColumn('ai_photo_requests', 'payment_confirmed_at')) {
                    $table->timestamp('payment_confirmed_at')->nullable()->after('payment_proof_uploaded_at');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ai_photo_requests')) {
            Schema::table('ai_photo_requests', function (Blueprint $table) {
                $cols = array_filter([
                    'payment_method',
                    'payment_proof_path',
                    'payment_proof_original_name',
                    'payment_proof_uploaded_at',
                    'payment_confirmed_at',
                ], fn ($col) => Schema::hasColumn('ai_photo_requests', $col));

                if (! empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }

        if (Schema::hasTable('ai_discount_rules')) {
            Schema::table('ai_discount_rules', function (Blueprint $table) {
                $cols = array_filter([
                    'qris_image_path',
                    'bank_name',
                    'bank_account_number',
                    'bank_account_holder',
                ], fn ($col) => Schema::hasColumn('ai_discount_rules', $col));

                if (! empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};
