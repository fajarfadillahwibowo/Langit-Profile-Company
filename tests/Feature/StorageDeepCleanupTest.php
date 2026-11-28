<?php

namespace Tests\Feature;

use App\Models\AiFaceScan;
use App\Models\AiPhoto;
use App\Models\AiPhotoRequest;
use App\Models\ClientDelivery;
use App\Models\ClientPhoto;
use App\Models\ClientRawPhoto;
use App\Models\ClientRawSelection;
use App\Models\User;
use App\Support\ClientPhotoThumbnail;
use App\Support\ClientRawPhotoThumbnail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class StorageDeepCleanupTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'name' => 'Admin Cleanup',
            'email' => 'admin-cleanup@langit.test',
            'role' => 'superadmin',
        ]);
    }

    public function test_deleting_client_delivery_purges_finished_raw_thumbnails_chunks_and_orphan_client_user(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $admin = $this->createAdmin();
        $client = User::factory()->create([
            'name' => 'Pelanggan Uji',
            'username' => 'pelangganuji',
            'email' => 'pelangganuji@pelanggan.langit',
            'role' => 'client',
        ]);

        $delivery = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => $client->name,
            'client_username' => $client->username,
            'client_email' => $client->email,
            'title' => 'Album Wedding HD',
            'expired_at' => now()->addDays(14),
            'is_active' => true,
        ]);

        $finishedPath = "client_photos/{$delivery->id}/photo_hd_1.jpg";
        $rawPath = "client_raw_photos/{$delivery->id}/raw_hd_1.jpg";
        Storage::disk('public')->put($finishedPath, 'finished-high-res-bytes');
        Storage::disk('public')->put($rawPath, 'raw-high-res-bytes');

        $photo = ClientPhoto::create([
            'client_delivery_id' => $delivery->id,
            'file_path' => $finishedPath,
            'original_name' => 'photo_hd_1.jpg',
            'file_size' => 1024000,
            'mime_type' => 'image/jpeg',
        ]);

        $rawPhoto = ClientRawPhoto::create([
            'client_delivery_id' => $delivery->id,
            'file_path' => $rawPath,
            'original_name' => 'raw_hd_1.jpg',
            'file_size' => 2048000,
            'mime_type' => 'image/jpeg',
        ]);

        ClientRawSelection::create([
            'client_delivery_id' => $delivery->id,
            'user_id' => $client->id,
            'selected_photo_ids' => [$rawPhoto->id],
            'total_selected' => 1,
            'price_per_photo' => 10000,
            'discount_percent' => 0,
            'subtotal' => 10000,
            'discount_amount' => 0,
            'final_price' => 10000,
            'status' => 'pending',
        ]);

        $finishedThumb = ClientPhotoThumbnail::THUMB_DIR."/{$photo->id}.webp";
        $rawThumb = ClientRawPhotoThumbnail::THUMB_DIR."/{$rawPhoto->id}.webp";
        Storage::disk('public')->put($finishedThumb, 'thumb-webp');
        Storage::disk('public')->put($rawThumb, 'raw-thumb-webp');

        $uploadUuid = (string) Str::uuid();
        DB::table('delivery_uploads')->insert([
            'id' => $uploadUuid,
            'user_id' => $admin->id,
            'client_delivery_id' => $delivery->id,
            'original_name' => 'interrupted.jpg',
            'size' => 1000,
            'chunks' => 1,
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        Storage::disk('local')->put("delivery_uploads/{$uploadUuid}/0.part", 'partial-chunk');

        $response = $this->actingAs($admin)->delete("/admin/client-deliveries/{$delivery->id}");
        $response->assertRedirect();

        // Verifikasi seluruh data database terhapus
        $this->assertDatabaseMissing('client_deliveries', ['id' => $delivery->id]);
        $this->assertDatabaseMissing('client_photos', ['id' => $photo->id]);
        $this->assertDatabaseMissing('client_raw_photos', ['id' => $rawPhoto->id]);
        $this->assertDatabaseMissing('client_raw_selections', ['client_delivery_id' => $delivery->id]);
        $this->assertDatabaseMissing('delivery_uploads', ['id' => $uploadUuid]);
        $this->assertDatabaseMissing('users', ['id' => $client->id]);

        // Verifikasi seluruh file & folder fisik di disk terhapus
        Storage::disk('public')->assertMissing($finishedPath);
        Storage::disk('public')->assertMissing($rawPath);
        Storage::disk('public')->assertMissing($finishedThumb);
        Storage::disk('public')->assertMissing($rawThumb);
        $this->assertFalse(Storage::disk('public')->exists("client_photos/{$delivery->id}"));
        $this->assertFalse(Storage::disk('public')->exists("client_raw_photos/{$delivery->id}"));
        $this->assertFalse(Storage::disk('local')->exists("delivery_uploads/{$uploadUuid}"));
    }

    public function test_deleting_one_delivery_keeps_client_user_when_another_delivery_exists(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $admin = $this->createAdmin();
        $client = User::factory()->create([
            'name' => 'Pelanggan Multi Album',
            'username' => 'multialbum',
            'email' => 'multialbum@pelanggan.langit',
            'role' => 'client',
        ]);

        $delivery1 = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => $client->name,
            'client_username' => $client->username,
            'client_email' => $client->email,
            'title' => 'Album 1',
            'expired_at' => now()->addDays(14),
            'is_active' => true,
        ]);

        $delivery2 = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => $client->name,
            'client_username' => $client->username,
            'client_email' => $client->email,
            'title' => 'Album 2',
            'expired_at' => now()->addDays(14),
            'is_active' => true,
        ]);

        Storage::disk('public')->put("client_raw_photos/{$delivery1->id}/a.jpg", 'raw-1');
        Storage::disk('public')->put("client_raw_photos/{$delivery2->id}/b.jpg", 'raw-2');

        $this->actingAs($admin)->delete("/admin/client-deliveries/{$delivery1->id}")->assertRedirect();

        $this->assertDatabaseMissing('client_deliveries', ['id' => $delivery1->id]);
        $this->assertDatabaseHas('client_deliveries', ['id' => $delivery2->id]);
        $this->assertDatabaseHas('users', ['id' => $client->id]);

        Storage::disk('public')->assertMissing("client_raw_photos/{$delivery1->id}/a.jpg");
        Storage::disk('public')->assertExists("client_raw_photos/{$delivery2->id}/b.jpg");
    }

    public function test_deleting_langitlens_customer_also_purges_their_client_delivery_files_without_touching_shared_event_photos(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $admin = $this->createAdmin();
        $customer = User::factory()->create([
            'name' => 'Customer Gabungan',
            'username' => 'custgabungan',
            'email' => 'custgabungan@example.com',
            'role' => 'customer',
        ]);

        $sharedAiPhoto = AiPhoto::create([
            'uploaded_by_admin_id' => $admin->id,
            'title' => 'Event Bersama',
            'original_filename' => 'event.jpg',
            'original_file_path' => 'ai_originals/2026/11/shared.jpg',
            'preview_watermarked_path' => 'ai_previews/2026/11/shared.webp',
            'original_width' => 4000,
            'original_height' => 3000,
            'original_size_bytes' => 5000000,
            'preview_size_bytes' => 120000,
            'price' => 25000,
            'is_active' => true,
        ]);
        Storage::disk('local')->put($sharedAiPhoto->original_file_path, 'shared-original');
        Storage::disk('public')->put($sharedAiPhoto->preview_watermarked_path, 'shared-preview');

        AiFaceScan::create([
            'customer_id' => $customer->id,
            'selected_face_embedding' => [0.1, 0.2],
            'matched_photo_ids' => [$sharedAiPhoto->id],
            'scanned_at' => now(),
        ]);

        $photoRequest = AiPhotoRequest::create([
            'customer_id' => $customer->id,
            'request_code' => 'LL-TEST-001',
            'total_selected_photos' => 1,
            'subtotal_price' => 25000,
            'discount_percentage_applied' => 0,
            'discount_amount' => 0,
            'total_final_price' => 25000,
            'status' => 'WAITING_MANUAL_PAYMENT',
            'requested_at' => now(),
        ]);

        $delivery = ClientDelivery::create([
            'user_id' => $customer->id,
            'client_name' => $customer->name,
            'client_username' => $customer->username,
            'client_email' => $customer->email,
            'title' => 'Album Pribadi Customer',
            'expired_at' => now()->addDays(7),
            'is_active' => true,
        ]);

        $rawPath = "client_raw_photos/{$delivery->id}/private_raw.jpg";
        Storage::disk('public')->put($rawPath, 'private-raw');
        $rawPhoto = ClientRawPhoto::create([
            'client_delivery_id' => $delivery->id,
            'file_path' => $rawPath,
            'original_name' => 'private_raw.jpg',
            'file_size' => 12345,
            'mime_type' => 'image/jpeg',
        ]);
        $rawThumb = ClientRawPhotoThumbnail::THUMB_DIR."/{$rawPhoto->id}.webp";
        Storage::disk('public')->put($rawThumb, 'private-raw-thumb');

        $this->actingAs($admin)->delete("/admin/langitlens/customers/{$customer->id}")->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $customer->id]);
        $this->assertDatabaseMissing('ai_face_scans', ['customer_id' => $customer->id]);
        $this->assertDatabaseMissing('ai_photo_requests', ['id' => $photoRequest->id]);
        $this->assertDatabaseMissing('client_deliveries', ['id' => $delivery->id]);

        Storage::disk('public')->assertMissing($rawPath);
        Storage::disk('public')->assertMissing($rawThumb);

        // Foto galeri event bersama tetap aman
        $this->assertDatabaseHas('ai_photos', ['id' => $sharedAiPhoto->id]);
        Storage::disk('local')->assertExists($sharedAiPhoto->original_file_path);
        Storage::disk('public')->assertExists($sharedAiPhoto->preview_watermarked_path);
    }

    public function test_orphan_cleanup_command_removes_only_unreferenced_files_and_keeps_active_files(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $client = User::factory()->create(['role' => 'client']);
        $activeDelivery = ClientDelivery::create([
            'user_id' => $client->id,
            'client_name' => $client->name,
            'client_username' => 'activeuser',
            'client_email' => $client->email,
            'title' => 'Album Aktif',
            'expired_at' => now()->addDays(10),
            'is_active' => true,
        ]);

        $activeRawPath = "client_raw_photos/{$activeDelivery->id}/keep.jpg";
        Storage::disk('public')->put($activeRawPath, 'keep-me');
        $activeRaw = ClientRawPhoto::create([
            'client_delivery_id' => $activeDelivery->id,
            'file_path' => $activeRawPath,
            'original_name' => 'keep.jpg',
            'file_size' => 100,
            'mime_type' => 'image/jpeg',
        ]);
        $activeRawThumb = ClientRawPhotoThumbnail::THUMB_DIR."/{$activeRaw->id}.webp";
        Storage::disk('public')->put($activeRawThumb, 'keep-thumb');

        // Simulasikan file sampah yatim yang sudah tidak ada di database
        Storage::disk('public')->put('client_photos/99999/old.jpg', 'orphan-finished');
        Storage::disk('public')->put('client_raw_photos/99999/old_raw.jpg', 'orphan-raw');
        Storage::disk('public')->put(ClientPhotoThumbnail::THUMB_DIR.'/99999.webp', 'orphan-thumb');
        Storage::disk('public')->put(ClientRawPhotoThumbnail::THUMB_DIR.'/99999.webp', 'orphan-raw-thumb');
        Storage::disk('local')->put('ai_originals/2026/11/orphan-ai.jpg', 'orphan-ai');
        Storage::disk('public')->put('ai_previews/2026/11/orphan-ai.webp', 'orphan-ai-preview');

        $this->artisan('storage:cleanup-orphans')->assertExitCode(0);

        // Semua sampah yatim harus hilang
        $this->assertFalse(Storage::disk('public')->exists('client_photos/99999'));
        $this->assertFalse(Storage::disk('public')->exists('client_raw_photos/99999'));
        Storage::disk('public')->assertMissing(ClientPhotoThumbnail::THUMB_DIR.'/99999.webp');
        Storage::disk('public')->assertMissing(ClientRawPhotoThumbnail::THUMB_DIR.'/99999.webp');
        Storage::disk('local')->assertMissing('ai_originals/2026/11/orphan-ai.jpg');
        Storage::disk('public')->assertMissing('ai_previews/2026/11/orphan-ai.webp');

        // Semua file aktif harus tetap utuh
        Storage::disk('public')->assertExists($activeRawPath);
        Storage::disk('public')->assertExists($activeRawThumb);
    }

    public function test_expired_purge_keeps_recently_expired_albums_hidden_and_purges_albums_past_grace_period(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $recentClient = User::factory()->create(['role' => 'client']);
        $oldClient = User::factory()->create(['role' => 'client']);

        // Expired 15 hari lalu -> masih dalam masa tenggang 90 hari (harus tetap ada / cuma hide)
        $recentExpired = ClientDelivery::create([
            'user_id' => $recentClient->id,
            'client_name' => $recentClient->name,
            'client_username' => 'recentexp',
            'client_email' => $recentClient->email,
            'title' => 'Album Baru Expired',
            'expired_at' => now()->subDays(15),
            'is_active' => true,
        ]);
        $recentPhotoPath = "client_photos/{$recentExpired->id}/keep_hidden.jpg";
        Storage::disk('public')->put($recentPhotoPath, 'recent-bytes');
        $recentPhoto = ClientPhoto::create([
            'client_delivery_id' => $recentExpired->id,
            'file_path' => $recentPhotoPath,
            'original_name' => 'keep_hidden.jpg',
            'file_size' => 500000,
            'mime_type' => 'image/jpeg',
        ]);

        // Expired 95 hari lalu -> sudah lewat masa tenggang 90 hari (harus auto-hapus tuntas)
        $oldExpired = ClientDelivery::create([
            'user_id' => $oldClient->id,
            'client_name' => $oldClient->name,
            'client_username' => 'oldexp',
            'client_email' => $oldClient->email,
            'title' => 'Album Lama Expired',
            'expired_at' => now()->subDays(95),
            'is_active' => true,
        ]);
        $oldFinishedPath = "client_photos/{$oldExpired->id}/old_hd.jpg";
        $oldRawPath = "client_raw_photos/{$oldExpired->id}/old_raw.jpg";
        Storage::disk('public')->put($oldFinishedPath, 'old-finished-bytes');
        Storage::disk('public')->put($oldRawPath, 'old-raw-bytes');

        $oldPhoto = ClientPhoto::create([
            'client_delivery_id' => $oldExpired->id,
            'file_path' => $oldFinishedPath,
            'original_name' => 'old_hd.jpg',
            'file_size' => 2000000,
            'mime_type' => 'image/jpeg',
        ]);
        $oldRaw = ClientRawPhoto::create([
            'client_delivery_id' => $oldExpired->id,
            'file_path' => $oldRawPath,
            'original_name' => 'old_raw.jpg',
            'file_size' => 3000000,
            'mime_type' => 'image/jpeg',
        ]);
        $oldThumb = ClientPhotoThumbnail::THUMB_DIR."/{$oldPhoto->id}.webp";
        $oldRawThumb = ClientRawPhotoThumbnail::THUMB_DIR."/{$oldRaw->id}.webp";
        Storage::disk('public')->put($oldThumb, 'old-thumb');
        Storage::disk('public')->put($oldRawThumb, 'old-raw-thumb');

        // 1. Dry-run tidak boleh menghapus apa pun
        $this->artisan('deliveries:purge-expired', ['--dry-run' => true])->assertExitCode(0);
        $this->assertDatabaseHas('client_deliveries', ['id' => $oldExpired->id]);
        Storage::disk('public')->assertExists($oldFinishedPath);

        // 2. Eksekusi auto-hapus (default 90 hari)
        $this->artisan('deliveries:purge-expired')->assertExitCode(0);

        // Album yang baru 15 hari expired tetap aman (hanya terkunci/hide di portal)
        $this->assertDatabaseHas('client_deliveries', ['id' => $recentExpired->id]);
        $this->assertDatabaseHas('client_photos', ['id' => $recentPhoto->id]);
        $this->assertDatabaseHas('users', ['id' => $recentClient->id]);
        Storage::disk('public')->assertExists($recentPhotoPath);
        $this->actingAs($recentClient)->get(route('client.photo.download', ['id' => $recentPhoto->id]))->assertStatus(403);

        // Album yang sudah 95 hari expired terhapus tuntas dari DB & disk
        $this->assertDatabaseMissing('client_deliveries', ['id' => $oldExpired->id]);
        $this->assertDatabaseMissing('client_photos', ['id' => $oldPhoto->id]);
        $this->assertDatabaseMissing('client_raw_photos', ['id' => $oldRaw->id]);
        $this->assertDatabaseMissing('users', ['id' => $oldClient->id]);
        Storage::disk('public')->assertMissing($oldFinishedPath);
        Storage::disk('public')->assertMissing($oldRawPath);
        Storage::disk('public')->assertMissing($oldThumb);
        Storage::disk('public')->assertMissing($oldRawThumb);
        $this->assertFalse(Storage::disk('public')->exists("client_photos/{$oldExpired->id}"));
        $this->assertFalse(Storage::disk('public')->exists("client_raw_photos/{$oldExpired->id}"));
    }

    public function test_admin_can_clear_all_langitlens_photos_from_database_and_vps_disk_while_keeping_customer_face_profiles(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $admin = $this->createAdmin();
        $customer = User::factory()->create([
            'role' => 'customer',
            'free_photo_quota' => 0,
            'free_photo_used_at' => now(),
        ]);

        $photo1 = AiPhoto::create([
            'uploaded_by_admin_id' => $admin->id,
            'title' => 'Event Lama 1',
            'original_filename' => 'event1.jpg',
            'original_file_path' => 'ai_originals/2026/11/old1.jpg',
            'preview_watermarked_path' => 'ai_previews/2026/11/old1.webp',
            'original_width' => 6000,
            'original_height' => 4000,
            'original_size_bytes' => 15000000,
            'preview_size_bytes' => 150000,
            'price' => 25000,
            'is_active' => true,
        ]);

        $photo2 = AiPhoto::create([
            'uploaded_by_admin_id' => $admin->id,
            'title' => 'Event Lama 2',
            'original_filename' => 'event2.jpg',
            'original_file_path' => 'ai_originals/2026/11/old2.jpg',
            'preview_watermarked_path' => 'ai_previews/2026/11/old2.webp',
            'original_width' => 6000,
            'original_height' => 4000,
            'original_size_bytes' => 18000000,
            'preview_size_bytes' => 180000,
            'price' => 25000,
            'is_active' => true,
        ]);

        $customer->update(['free_photo_id' => $photo1->id]);

        Storage::disk('local')->put($photo1->original_file_path, 'raw-high-res-1');
        Storage::disk('local')->put($photo2->original_file_path, 'raw-high-res-2');
        Storage::disk('local')->put('temp_REQ-OLD.zip', 'old-temp-zip');
        Storage::disk('public')->put($photo1->preview_watermarked_path, 'preview-1');
        Storage::disk('public')->put($photo2->preview_watermarked_path, 'preview-2');

        \App\Models\AiPhotoFace::create([
            'photo_id' => $photo1->id,
            'face_embedding' => array_fill(0, 128, 0.1),
            'bounding_box' => ['x' => 0.1, 'y' => 0.1, 'width' => 0.3, 'height' => 0.3],
            'confidence_score' => 0.99,
        ]);

        $scan = AiFaceScan::create([
            'customer_id' => $customer->id,
            'selected_face_embedding' => ['front' => array_fill(0, 128, 0.1)],
            'matched_photo_ids' => [$photo1->id, $photo2->id],
            'scanned_at' => now(),
        ]);

        // Pelanggan biasa tidak boleh menghapus semua foto galeri (403)
        $this->actingAs($customer)
            ->delete('/admin/langitlens/photos/clear-all')
            ->assertForbidden();
        $this->assertEquals(2, AiPhoto::count());

        // Admin menghapus semua foto galeri sekaligus
        $this->actingAs($admin)
            ->delete('/admin/langitlens/photos/clear-all')
            ->assertRedirect()
            ->assertSessionHas('success');

        // Database foto & indeks wajah bersih 100%
        $this->assertEquals(0, AiPhoto::count());
        $this->assertEquals(0, \App\Models\AiPhotoFace::count());

        // File asli, preview watermark, folder, & ZIP sementara di disk VPS bersih 100%
        Storage::disk('local')->assertMissing($photo1->original_file_path);
        Storage::disk('local')->assertMissing($photo2->original_file_path);
        Storage::disk('local')->assertMissing('temp_REQ-OLD.zip');
        $this->assertFalse(Storage::disk('local')->exists('ai_originals'));
        Storage::disk('public')->assertMissing($photo1->preview_watermarked_path);
        Storage::disk('public')->assertMissing($photo2->preview_watermarked_path);
        $this->assertFalse(Storage::disk('public')->exists('ai_previews'));

        // Akun & profil scan 3 wajah permanen pelanggan tetap aman (hanya matched_photo_ids direset)
        $scan->refresh();
        $customer->refresh();
        $this->assertNotNull($scan->selected_face_embedding);
        $this->assertSame([], $scan->matched_photo_ids);
        $this->assertNull($customer->free_photo_id);
        $this->assertNotNull($customer->free_photo_used_at);
    }
}
