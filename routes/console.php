<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('delivery-uploads:prune', function () {
    $disk = \Illuminate\Support\Facades\Storage::disk('local');
    \Illuminate\Support\Facades\DB::table('delivery_uploads')->whereNull('client_photo_id')->where('expires_at', '<', now())
        ->orderBy('id')->chunkById(100, function ($rows) use ($disk) {
            foreach ($rows as $row) {
                \Illuminate\Support\Facades\DB::transaction(function () use ($row, $disk) {
                    $current = \Illuminate\Support\Facades\DB::table('delivery_uploads')->where('id', $row->id)->lockForUpdate()->first();
                    if ($current && ! $current->client_photo_id && now()->greaterThan($current->expires_at)) {
                        $disk->deleteDirectory('delivery_uploads/'.$current->id);
                        \Illuminate\Support\Facades\DB::table('delivery_uploads')->where('id', $current->id)->delete();
                    }
                });
            }
        });
    // Also remove abandoned directories left by deleted albums, never arbitrary paths.
    foreach ($disk->directories('delivery_uploads') as $dir) {
        $uuid = basename($dir);
        if (! \Illuminate\Support\Str::isUuid($uuid) || is_link($disk->path($dir))) { continue; }
        if (! \Illuminate\Support\Facades\DB::table('delivery_uploads')->where('id', $uuid)->exists()
            && filemtime($disk->path($dir)) < now()->subDays(7)->timestamp) { $disk->deleteDirectory($dir); }
    }
    $this->info('Expired private delivery chunks pruned.');
})->purpose('Remove expired private delivery upload chunks safely');

\Illuminate\Support\Facades\Schedule::command('delivery-uploads:prune')->daily()->withoutOverlapping();

Artisan::command('deliveries:purge-expired {--days= : Jumlah hari masa tenggang setelah expired (default config/env 90 hari)} {--dry-run : Cek album yang akan dihapus tanpa menghapus data}', function () {
    $daysOption = $this->option('days');
    $graceDays = ($daysOption !== null && $daysOption !== '') ? (int) $daysOption : null;
    $dryRun = (bool) $this->option('dry-run');

    $stats = \App\Support\ClientDeliveryStorageCleanup::purgeExpiredDeliveries($graceDays, $dryRun);
    $mb = number_format($stats['bytes_freed'] / 1048576, 2);
    $mode = $dryRun ? '[DRY RUN]' : '[BERSIH]';

    $this->info("{$mode} Auto-hapus album expired (masa tenggang {$stats['grace_days']} hari):");
    $this->line("- Album pelanggan dihapus: {$stats['deliveries_purged']}");
    $this->line("- Foto jadi terhapus: {$stats['finished_photos']}");
    $this->line("- Foto mentahan terhapus: {$stats['raw_photos']}");
    $this->info("Estimasi ruang dibebaskan: {$mb} MB");
})->purpose('Hapus otomatis album pelanggan beserta file fisiknya setelah melewati masa tenggang pasca-expired');

\Illuminate\Support\Facades\Schedule::command('deliveries:purge-expired')->daily()->withoutOverlapping();

Artisan::command('storage:cleanup-orphans {--dry-run : Tampilkan daftar sampah tanpa menghapus file}', function () {
    $dryRun = (bool) $this->option('dry-run');
    $stats = \App\Support\ClientDeliveryStorageCleanup::purgeOrphanStorage($dryRun);
    $mb = number_format($stats['bytes_freed'] / 1048576, 2);
    $mode = $dryRun ? '[DRY RUN]' : '[BERSIH]';

    $this->info("{$mode} Pembersihan file yatim selesai:");
    $this->line("- Folder foto jadi yatim: {$stats['client_photo_dirs']}");
    $this->line("- Folder foto mentahan yatim: {$stats['client_raw_dirs']}");
    $this->line("- Thumbnail foto jadi yatim: {$stats['client_photo_thumbs']}");
    $this->line("- Thumbnail foto mentahan yatim: {$stats['client_raw_thumbs']}");
    $this->line("- File asli LangitLens yatim: {$stats['ai_originals']}");
    $this->line("- Preview LangitLens yatim: {$stats['ai_previews']}");
    $this->line("- File ZIP sementara kadaluarsa: {$stats['temp_zips']}");
    $this->info("Total ruang dibebaskan: {$mb} MB");
})->purpose('Bersihkan file foto, thumbnail, dan ZIP yatim yang sudah tidak ada di database');

\Illuminate\Support\Facades\Schedule::command('storage:cleanup-orphans')->daily()->withoutOverlapping();
