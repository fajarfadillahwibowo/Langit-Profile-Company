<?php

namespace App\Services\LangitLens;

use Illuminate\Support\Facades\Http;

class InsightFaceClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.insightface.url', 'http://127.0.0.1:8001'), '/');
    }

    public function isHealthy(bool $autoStartIfDown = true): bool
    {
        if ($this->pingHealth()) {
            return true;
        }

        if ($autoStartIfDown) {
            return $this->ensureRunning();
        }

        return false;
    }

    private function pingHealth(): bool
    {
        try {
            $res = Http::connectTimeout(2)->timeout(4)->get("{$this->baseUrl}/health");

            return $res->successful() && ($res->json('ready') === true);
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Otomatis hidupkan server Python InsightFace (port 8001) di background jika belum jalan.
     */
    public function ensureRunning(): bool
    {
        if ($this->pingHealth()) {
            return true;
        }

        $pythonExe = 'D:\\laragon\\www\\fotoyu-langit\\ai-service\\.venv\\Scripts\\python.exe';
        $scriptPath = base_path('ai-service\\main.py');
        if (! is_file($scriptPath)) {
            $scriptPath = 'D:\\laragon\\www\\fotoyu-langit\\ai-service\\main.py';
        }

        if (PHP_OS_FAMILY === 'Windows' && is_file($pythonExe) && is_file($scriptPath)) {
            $workDir = dirname($scriptPath);
            $cmd = sprintf('start "" /B /D "%s" "%s" "%s" >NUL 2>&1', $workDir, $pythonExe, $scriptPath);
            @pclose(@popen($cmd, 'r'));

            for ($i = 0; $i < 16; $i++) {
                usleep(500_000);
                if ($this->pingHealth()) {
                    return true;
                }
            }
        }

        return $this->pingHealth();
    }

    /**
     * Kirim file gambar ke layanan InsightFace (RetinaFace + ArcFace 512-D).
     *
     * @return array{width: int, height: int, engine: string, snapshotDataUrl: ?string, faces: array<int, array<string, mixed>>}
     */
    public function detectFromPath(
        string $filePath,
        bool $mirrorHorizontal = false,
        bool $includeSnapshot = false,
        bool $includeThumbs = true
    ): array {
        $contents = file_get_contents($filePath);
        if ($contents === false) {
            throw new \RuntimeException('Gagal membaca file gambar untuk dianalisis InsightFace.');
        }

        $payload = [
            'mirror_horizontal' => $mirrorHorizontal ? 'true' : 'false',
            'include_snapshot' => $includeSnapshot ? 'true' : 'false',
            'include_thumbs' => $includeThumbs ? 'true' : 'false',
        ];

        try {
            $res = Http::connectTimeout(3)
                ->timeout(60)
                ->attach('file', $contents, basename($filePath))
                ->post("{$this->baseUrl}/detect", $payload);
        } catch (\Throwable) {
            $this->ensureRunning();
            $res = Http::connectTimeout(3)
                ->timeout(60)
                ->attach('file', $contents, basename($filePath))
                ->post("{$this->baseUrl}/detect", $payload);
        }

        if (! $res->successful()) {
            throw new \RuntimeException('InsightFace service error: '.$res->body());
        }

        return $res->json();
    }
}
