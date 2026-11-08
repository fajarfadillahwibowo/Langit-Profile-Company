<?php

namespace Tests\Feature;

use App\Models\Gallery;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GalleryAlbumTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $extra = []): array
    {
        $service = Service::firstOrCreate(['slug' => 'photography-videography'], ['name' => 'Photo & Video', 'is_active' => true]);
        return array_replace(['title' => 'Test album', 'category' => 'wedding', 'service_id' => $service->id,
            'media_type' => 'photo', 'file_webp_path' => '/cover.jpg', 'description' => 'Session description'], $extra);
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_photo_video_cover_and_album_enforce_five_mib_boundary(): void
    {
        $this->post('/admin/galleries', $this->payload([
            'file_photo' => UploadedFile::fake()->image('cover.jpg')->size(5120),
            'album_photos' => [UploadedFile::fake()->image('album.jpg')->size(5120)],
        ]))->assertSessionHasNoErrors();
        $gallery = Gallery::sole();
        foreach (['/admin/galleries', '/admin/galleries/'.$gallery->id.'/update'] as $url) {
            foreach (['file_photo', 'album_photos'] as $field) {
                $bad = UploadedFile::fake()->image('large.jpg')->size(5121);
                $this->postJson($url, $this->payload([
                    'title' => 'Oversize '.$field,
                    'album_photos' => [UploadedFile::fake()->image('ok.jpg')],
                    $field => $field === 'album_photos' ? [$bad] : $bad,
                ]))->assertUnprocessable()->assertJsonValidationErrors($field === 'album_photos' ? 'album_photos.0' : $field);
            }
        }
    }

    public function test_delete_does_not_follow_client_cover_traversal_paths(): void
    {
        $guard = public_path('uploads/gallery-album-delete-guard.txt');
        file_put_contents($guard, 'protected test fixture');
        try {
            $gallery = Gallery::create(array_merge($this->payload(['file_webp_path' => '/uploads/galleries/../gallery-album-delete-guard.txt']), ['slug' => 'guard']));
            $this->delete('/admin/galleries/'.$gallery->id)->assertRedirect();
            $this->assertFileExists($guard);
        } finally {
            if (is_file($guard)) { unlink($guard); }
        }
    }

    public function test_uploaded_cover_is_separate_replaceable_and_cleaned_up_safely(): void
    {
        $this->post('/admin/galleries', $this->payload(['file_photo' => UploadedFile::fake()->image('cover.jpg'), 'album_photos' => [UploadedFile::fake()->image('a.jpg')]]))->assertSessionHasNoErrors();
        $gallery = Gallery::sole();
        $old = $gallery->file_webp_path;
        $this->assertStringContainsString('/storage/galleries/covers/', $old);
        $this->assertCount(1, $gallery->exif_metadata_json['sub_photos']);
        $this->assertCount(2, Storage::disk('public')->allFiles());
        $this->post('/admin/galleries/'.$gallery->id.'/update', $this->payload(['file_photo' => UploadedFile::fake()->image('new.png')]))->assertSessionHasNoErrors();
        $this->assertNotSame($old, $gallery->refresh()->file_webp_path);
        $this->assertCount(2, Storage::disk('public')->allFiles());
        $this->delete('/admin/galleries/'.$gallery->id)->assertRedirect();
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_invalid_counts_and_image_files_are_rejected_without_writes(): void
    {
        foreach ([[], array_fill(0, 11, UploadedFile::fake()->image('a.jpg')),
            [UploadedFile::fake()->create('bad.php', 1, 'application/x-httpd-php')],
            [UploadedFile::fake()->image('huge.jpg')->size(51201)]] as $files) {
            $this->postJson('/admin/galleries', $this->payload(['album_photos' => $files]))->assertUnprocessable();
        }
        $this->assertDatabaseCount('galleries', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_update_retains_removes_appends_and_preserves_cover_and_exif(): void
    {
        $this->post('/admin/galleries', $this->payload(['album_photos' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')]]));
        $gallery = Gallery::sole();
        $old = $gallery->exif_metadata_json['sub_photos'];
        $meta = $gallery->exif_metadata_json;
        $meta['custom'] = 'preserved';
        $gallery->update(['exif_metadata_json' => $meta]);
        $this->post('/admin/galleries/'.$gallery->id.'/update', $this->payload(['file_webp_path' => '', 'remove_album_photos' => [0], 'album_photos' => [UploadedFile::fake()->image('c.png')]]))->assertSessionHasNoErrors();
        $gallery->refresh();
        $this->assertSame('/cover.jpg', $gallery->file_webp_path);
        $this->assertSame('preserved', $gallery->exif_metadata_json['custom']);
        $this->assertCount(2, $gallery->exif_metadata_json['sub_photos']);
        $this->assertSame($old[1], $gallery->exif_metadata_json['sub_photos'][0]);
        $this->assertCount(2, Storage::disk('public')->allFiles());
        $this->delete('/admin/galleries/'.$gallery->id)->assertRedirect();
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_update_counts_retained_photos_and_rejects_foreign_removal_paths(): void
    {
        $this->post('/admin/galleries', $this->payload(['album_photos' => [UploadedFile::fake()->image('a.jpg')]]));
        $gallery = Gallery::sole();
        $url = '/admin/galleries/'.$gallery->id.'/update';
        $this->postJson($url, $this->payload(['album_photos' => array_fill(0, 10, UploadedFile::fake()->image('b.jpg'))]))->assertUnprocessable()->assertJsonValidationErrors('album_photos');
        foreach ([[0], [99], ['/storage/other.jpg'], [0, 0]] as $remove) {
            $this->postJson($url, $this->payload(['remove_album_photos' => $remove]))->assertUnprocessable();
        }
        $this->assertCount(1, Storage::disk('public')->allFiles());
        $this->assertCount(1, $gallery->refresh()->exif_metadata_json['sub_photos']);
    }

    public function test_legacy_and_other_media_can_be_updated_without_album(): void
    {
        foreach (['photo', 'video', 'before_after'] as $type) {
            $gallery = Gallery::create(array_merge($this->payload(['media_type' => $type]), ['slug' => $type]));
            $this->post('/admin/galleries/'.$gallery->id.'/update', $this->payload(['media_type' => $type]))->assertSessionHasNoErrors();
        }
        $service = Service::create(['slug' => 'other', 'name' => 'Other']);
        $this->post('/admin/galleries', $this->payload(['service_id' => $service->id]))->assertSessionHasNoErrors();
    }

    public function test_gallery_mutations_keep_admin_authorization(): void
    {
        auth()->logout();
        $this->post('/admin/galleries', $this->payload())->assertRedirect('/login');
        $this->post('/admin/galleries/1/update', $this->payload())->assertRedirect('/login');
        $this->delete('/admin/galleries/1')->assertRedirect('/login');
    }

    public function test_create_stores_ten_album_photos_separately_from_cover(): void
    {
        $this->post('/admin/galleries', $this->payload(['album_photos' => array_map(fn ($i) => UploadedFile::fake()->image("photo$i.jpg"), range(1, 10))]))
            ->assertSessionHasNoErrors()->assertRedirect();
        $gallery = Gallery::sole();
        $this->assertSame('/cover.jpg', $gallery->file_webp_path);
        $this->assertCount(10, $gallery->exif_metadata_json['sub_photos'] ?? []);
        $this->assertSame('Session description', $gallery->exif_metadata_json['description']);
        $this->assertCount(10, Storage::disk('public')->allFiles('galleries/albums'));
    }
}
