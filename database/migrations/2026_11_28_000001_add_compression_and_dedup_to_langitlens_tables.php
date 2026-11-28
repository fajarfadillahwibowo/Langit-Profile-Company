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
                if (! Schema::hasColumn('ai_discount_rules', 'compress_uploads_enabled')) {
                    $table->boolean('compress_uploads_enabled')->default(true)->after('is_active');
                }
                if (! Schema::hasColumn('ai_discount_rules', 'compress_max_mb')) {
                    $table->decimal('compress_max_mb', 4, 2)->default(2.00)->after('compress_uploads_enabled');
                }
                if (! Schema::hasColumn('ai_discount_rules', 'compress_max_dimension')) {
                    $table->unsignedSmallInteger('compress_max_dimension')->default(2400)->after('compress_max_mb');
                }
                if (! Schema::hasColumn('ai_discount_rules', 'compress_quality')) {
                    $table->unsignedTinyInteger('compress_quality')->default(88)->after('compress_max_dimension');
                }
            });
        }

        if (Schema::hasTable('ai_photos')) {
            Schema::table('ai_photos', function (Blueprint $table) {
                if (! Schema::hasColumn('ai_photos', 'source_size_bytes')) {
                    $table->unsignedBigInteger('source_size_bytes')->nullable()->after('original_size_bytes');
                }
                if (! Schema::hasColumn('ai_photos', 'file_hash')) {
                    $table->string('file_hash', 64)->nullable()->index()->after('original_filename');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ai_photos')) {
            Schema::table('ai_photos', function (Blueprint $table) {
                if (Schema::hasColumn('ai_photos', 'file_hash')) {
                    $table->dropIndex(['file_hash']);
                    $table->dropColumn('file_hash');
                }
                if (Schema::hasColumn('ai_photos', 'source_size_bytes')) {
                    $table->dropColumn('source_size_bytes');
                }
            });
        }

        if (Schema::hasTable('ai_discount_rules')) {
            Schema::table('ai_discount_rules', function (Blueprint $table) {
                $cols = array_filter([
                    'compress_uploads_enabled',
                    'compress_max_mb',
                    'compress_max_dimension',
                    'compress_quality',
                ], fn ($col) => Schema::hasColumn('ai_discount_rules', $col));

                if (! empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};
