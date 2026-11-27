<?php

namespace Tests\Feature;

use App\Models\Gallery;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminDashboardDataPreservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_viewing_the_dashboard_preserves_existing_galleries_without_inserting_samples(): void
    {
        $admin = User::factory()->create(['role' => 'superadmin']);
        $collaboration = Service::create(['name' => 'Kolaborasi', 'slug' => 'kolaborasi', 'is_active' => true]);
        Service::create(['name' => 'Web Development', 'slug' => 'web-development', 'is_active' => true]);
        Gallery::create([
            'service_id' => $collaboration->id,
            'title' => 'Galeri mitra produksi',
            'slug' => 'galeri-mitra-produksi',
            'category' => 'b2b_partner',
            'media_type' => 'photo',
            'file_webp_path' => '/uploads/galleries/mitra-produksi.jpg',
        ]);
        $originalGalleries = DB::table('galleries')->orderBy('id')->get()->toJson();

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();

        $this->assertSame($originalGalleries, DB::table('galleries')->orderBy('id')->get()->toJson());
    }
}
