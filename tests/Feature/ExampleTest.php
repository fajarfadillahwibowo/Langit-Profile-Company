<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Database\Seeders\DatabaseSeeder;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_adaptive_service_pages_render_successfully(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get('/layanan/photography-videography')->assertStatus(200);
        $this->get('/layanan/web-development')->assertStatus(200);
        $this->get('/layanan/langit-education')->assertStatus(200);
        $this->get('/layanan/computer-service')->assertStatus(200);
        $this->get('/layanan/internship')->assertStatus(200);
        $this->get('/layanan/sewa-alat')->assertStatus(200);
        $this->get('/layanan/kolaborasi')->assertStatus(200);
        $this->get('/portofolio')->assertStatus(200);
        $this->get('/kontak')->assertStatus(200);
        $this->get('/konsultasi')->assertStatus(200);
    }

    public function test_live_service_tracker_api(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->get('/api/service-tracker/SRV-2026-0089');
        $response->assertStatus(200);
        $response->assertJsonPath('ticket.receipt_number', 'SRV-2026-0089');
    }
}
