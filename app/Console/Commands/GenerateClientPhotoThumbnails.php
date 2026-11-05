<?php

namespace App\Console\Commands;

use App\Models\ClientPhoto;
use App\Support\ClientPhotoThumbnail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateClientPhotoThumbnails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'delivery:generate-thumbs {--force : Paksa buat ulang semua thumbnail meskipun sudah ada}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Buat thumbnail WebP ringan (~40-80KB) untuk semua foto pelanggan agar loading galeri instan';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $photos = ClientPhoto::orderBy('id', 'asc')->get();
        $total = $photos->count();

        if ($total === 0) {
            $this->info('Tidak ada foto pelanggan yang ditemukan.');
            return self::SUCCESS;
        }

        $this->info("Memproses {$total} foto pelanggan untuk pembuatan thumbnail cepat...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $generated = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($photos as $photo) {
            $thumbPath = ClientPhotoThumbnail::THUMB_DIR . "/{$photo->id}.webp";

            if (!$force && Storage::disk('public')->exists($thumbPath)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            try {
                $result = ClientPhotoThumbnail::generate($photo);
                if ($result) {
                    $generated++;
                } else {
                    $failed++;
                }
            } catch (\Throwable $e) {
                $failed++;
            }

            // Bebaskan memory PHP setelah pemrosesan tiap foto
            gc_collect_cycles();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Selesai! Hasil pembuatan thumbnail:");
        $this->line("  - Berhasil dibuat: {$generated}");
        $this->line("  - Sudah ada (dilewati): {$skipped}");
        $this->line("  - Gagal / non-gambar: {$failed}");

        return self::SUCCESS;
    }
}
