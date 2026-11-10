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

    public function test_admin_can_update_raw_settings_via_inertia_without_plain_json(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $delivery = ClientDelivery::create([
            'user_id' => $admin->id,
            'client_name' => 'Settings Test',
            'client_username' => 'settingstest',
            'client_email' => 'settings@test.com',
            'title' => 'Settings Album',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->withHeaders(['X-Inertia' => 'true'])
            ->put("/admin/client-deliveries/{$delivery->id}/raw-settings", [
                'raw_price_per_photo' => 25000,
                'raw_price_description' => 'Rp 25.000 / foto',
                'raw_discount_5_percent' => 15,
                'raw_discount_10_percent' => 30,
                'raw_notes' => 'Catatan promo spesial',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $delivery->refresh();
        $this->assertSame(25000.0, (float) $delivery->raw_price_per_photo);
        $this->assertSame(15.0, (float) $delivery->raw_discount_5_percent);
        $this->assertSame(30.0, (float) $delivery->raw_discount_10_percent);
        $this->assertSame('Catatan promo spesial', $delivery->raw_notes);
    }

    public function test_admin_can_update_raw_selection_status_via_inertia_without_plain_json(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client']);
        $delivery = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => 'Selection Test',
            'client_username' => 'selectiontest',
            'client_email' => 'selection@test.com',
            'title' => 'Selection Album',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        $selection = ClientRawSelection::create([
            'client_delivery_id' => $delivery->id,
            'user_id' => $client->id,
            'selected_photo_ids' => [1, 2],
            'total_photos' => 2,
            'price_per_photo' => 15000,
            'subtotal' => 30000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)
            ->withHeaders(['X-Inertia' => 'true'])
            ->put("/admin/client-raw-selections/{$selection->id}/status", [
                'status' => 'editing',
                'admin_notes' => 'Sedang diedit oleh tim fotografer',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $selection->refresh();
        $this->assertSame('editing', $selection->status);
        $this->assertSame('Sedang diedit oleh tim fotografer', $selection->admin_notes);
    }
}
