<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminServiceCardTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_admin_can_update_service_card_photo_and_description(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::first();
        $service = Service::where('slug', 'photography-videography')->firstOrFail();

        $response = $this->actingAs($admin)->post('/admin/services/'.$service->id.'/update', [
            'name' => 'Photography & Cinema Studio',
            'tagline' => 'Wedding, Wisuda & Cinema Updated',
            'description' => 'Deskripsi baru mahakarya fotografi dan videografi sinematik profesional.',
            'image_url' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
            'accent_color' => '#F59E0B',
            'vip_label' => 'Cinema Master',
            'ribbon_text' => 'PLATINUM',
            'serial_number' => '9999 ••••',
            'tags' => ['Sony FX3', 'Master Grade'],
            'is_active' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $service->refresh();
        $this->assertSame('Photography & Cinema Studio', $service->name);
        $this->assertSame('Deskripsi baru mahakarya fotografi dan videografi sinematik profesional.', $service->description);
        $this->assertSame('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80', $service->image_url);
        $this->assertSame('PLATINUM', $service->ribbon_text);
    }
}
