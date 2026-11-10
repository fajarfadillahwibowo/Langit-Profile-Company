<?php

namespace Tests\Feature;

use App\Models\ClientDelivery;
use App\Models\ClientRawPhoto;
use App\Models\ClientRawSelection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClientRawPhotosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_client_submitting_selection_via_inertia_receives_inertia_redirect_not_plain_json(): void
    {
        $client = User::factory()->create([
            'role' => 'client',
            'username' => 'test_client',
        ]);

        $delivery = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => 'Test Client',
            'client_username' => 'test_client',
            'client_email' => 'client@test.com',
            'title' => 'Album Raw Test',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
            'raw_price_per_photo' => 15000,
            'raw_discount_5_percent' => 10,
            'raw_discount_10_percent' => 20,
        ]);

        $photos = [];
        for ($i = 1; $i <= 5; $i++) {
            $photos[] = ClientRawPhoto::create([
                'client_delivery_id' => $delivery->id,
                'file_path' => "client_raw_photos/{$delivery->id}/photo{$i}.jpg",
                'original_name' => "_DSC000{$i}.JPG",
                'file_size' => 1000000,
            ]);
        }

        $photoIds = array_map(fn ($p) => $p->id, $photos);

        // Inertia sends X-Inertia header
        $response = $this->actingAs($client)
            ->withHeaders(['X-Inertia' => 'true'])
            ->post('/pelanggan/foto-mentahan/pilih', [
                'client_delivery_id' => $delivery->id,
                'photo_ids' => $photoIds,
                'notes' => 'Tolong retouch warna',
            ]);

        // Must redirect back with flash session, NOT plain JSON
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('client_raw_selections', [
            'client_delivery_id' => $delivery->id,
            'user_id' => $client->id,
            'total_photos' => 5,
            'price_per_photo' => 15000,
            'subtotal' => 75000,
            'discount_percent' => 10,
            'discount_amount' => 7500,
            'total_price' => 67500,
            'notes' => 'Tolong retouch warna',
            'status' => 'pending',
        ]);
    }

    public function test_ten_or_more_photos_receives_tier_two_discount(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $delivery = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => 'Client 10 Photos',
            'client_username' => 'client10',
            'client_email' => 'client10@test.com',
            'title' => 'Album 10 Photos',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
            'raw_price_per_photo' => 20000,
            'raw_discount_5_percent' => 15,
            'raw_discount_10_percent' => 25,
        ]);

        $photoIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $p = ClientRawPhoto::create([
                'client_delivery_id' => $delivery->id,
                'file_path' => "client_raw_photos/{$delivery->id}/photo{$i}.jpg",
                'original_name' => "_DSC00{$i}.JPG",
                'file_size' => 1000000,
            ]);
            $photoIds[] = $p->id;
        }

        $this->actingAs($client)
            ->withHeaders(['X-Inertia' => 'true'])
            ->post('/pelanggan/foto-mentahan/pilih', [
                'client_delivery_id' => $delivery->id,
                'photo_ids' => $photoIds,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('client_raw_selections', [
            'client_delivery_id' => $delivery->id,
            'total_photos' => 10,
            'subtotal' => 200000,
            'discount_percent' => 25,
            'discount_amount' => 50000,
            'total_price' => 150000,
        ]);
    }
}
