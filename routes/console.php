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
