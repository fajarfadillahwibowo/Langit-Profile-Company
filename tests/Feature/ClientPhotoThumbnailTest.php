<?php

namespace Tests\Feature;

use App\Models\ClientDelivery;
use App\Models\ClientPhoto;
use App\Models\User;
use App\Support\ClientPhotoThumbnail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClientPhotoThumbnailTest extends TestCase
{
    use RefreshDatabase;

    public function test_thumbnail_is_generated_and_served_via_preview_route(): void
    {
        Storage::fake('public');

        $clientUser = User::factory()->create([
            'username' => 'testclient',
            'role' => 'client',
        ]);

        $delivery = ClientDelivery::create([
            'user_id' => $clientUser->id,
            'client_name' => 'Budi Santoso',
            'client_username' => 'testclient',
            'client_email' => 'budi@example.com',
            'title' => 'Dokumentasi Wedding Budi',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        // Buat file gambar resolusi tinggi palsu
        $image = UploadedFile::fake()->image('wedding_photo.jpg', 2400, 1600);
        $path = $image->store("client_photos/{$delivery->id}", 'public');

        $photo = ClientPhoto::create([
            'client_delivery_id' => $delivery->id,
            'file_path' => $path,
            'original_name' => 'wedding_photo.jpg',
            'file_size' => filesize($image->getPathname()),
            'mime_type' => 'image/jpeg',
        ]);

        // Verifikasi thumbnail_url mengarah ke preview route atau static storage
        $this->assertNotEmpty($photo->thumbnail_url);

        // Akses endpoint preview tanpa login -> dialihkan / ditolak
        $guestResponse = $this->get(route('client.photo.preview', ['id' => $photo->id]));
        $guestResponse->assertStatus(403);

        // Akses endpoint preview sebagai pemilik foto -> HTTP 200 & content-type image/webp
        $this->actingAs($clientUser);
        $response = $this->get(route('client.photo.preview', ['id' => $photo->id]));
        $response->assertOk();
        $this->assertTrue(
            in_array($response->headers->get('Content-Type'), ['image/webp', 'image/jpeg'], true)
        );
        $this->assertStringContainsString('max-age=', $response->headers->get('Cache-Control'));

        // Verifikasi file thumbnail fisik tersimpan di disk
        $this->assertTrue(Storage::disk('public')->exists(ClientPhotoThumbnail::THUMB_DIR . "/{$photo->id}.webp"));

        // Verifikasi galeri pelanggan memuat deliveries dengan attribute thumbnail_url
        $galleryResponse = $this->get(route('client.gallery'));
        $galleryResponse->assertOk();
    }

    public function test_thumbnail_cleanup_when_photo_is_deleted(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client']);

        $delivery = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => 'Siti',
            'client_username' => 'siti',
            'client_email' => 'siti@example.com',
            'title' => 'Graduation Siti',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        $image = UploadedFile::fake()->image('grad.jpg', 1200, 800);
        $path = $image->store("client_photos/{$delivery->id}", 'public');

        $photo = ClientPhoto::create([
            'client_delivery_id' => $delivery->id,
            'file_path' => $path,
            'original_name' => 'grad.jpg',
            'file_size' => filesize($image->getPathname()),
            'mime_type' => 'image/jpeg',
        ]);

        // Generate thumbnail
        ClientPhotoThumbnail::generate($photo);
        $this->assertTrue(Storage::disk('public')->exists(ClientPhotoThumbnail::THUMB_DIR . "/{$photo->id}.webp"));

        // Hapus foto via admin endpoint
        $this->actingAs($admin);
        $this->delete(route('admin.client-photos.delete', ['id' => $photo->id]))->assertRedirect();

        // Verifikasi thumbnail ikut terhapus dari disk
        $this->assertFalse(Storage::disk('public')->exists(ClientPhotoThumbnail::THUMB_DIR . "/{$photo->id}.webp"));
    }
}
