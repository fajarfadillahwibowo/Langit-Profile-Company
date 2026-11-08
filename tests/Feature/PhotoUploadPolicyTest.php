<?php

namespace Tests\Feature;

use App\Models\ClientDelivery;
use App\Models\Gallery;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoUploadPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    public function test_other_gallery_photos_and_before_after_enforce_two_mib_on_create_and_update(): void
    {
        $service = Service::create(['slug' => 'other', 'name' => 'Other']);
        $payload = ['title' => 'Other gallery', 'category' => 'other', 'service_id' => $service->id, 'media_type' => 'photo'];
        $this->post('/admin/galleries', $payload + ['file_photo' => UploadedFile::fake()->image('cover.jpg')->size(2048)])->assertSessionHasNoErrors();
        $gallery = Gallery::sole();
        foreach (['/admin/galleries', '/admin/galleries/'.$gallery->id.'/update'] as $url) {
            foreach (['file_photo', 'before_file_photo'] as $field) {
                $this->postJson($url, array_replace($payload, ['title' => 'Oversize '.$field, $field => UploadedFile::fake()->image('large.jpg')->size(2049)]))
                    ->assertUnprocessable()->assertJsonValidationErrors($field);
            }
        }
        $this->postJson('/admin/galleries/'.$gallery->id.'/update', $payload + ['file_video' => UploadedFile::fake()->image('disguised.jpg')->size(2049)])
            ->assertUnprocessable()->assertJsonValidationErrors('file_video');
        $this->post('/admin/galleries/'.$gallery->id.'/update', $payload + ['file_video' => UploadedFile::fake()->create('legacy.mp4', 102401, 'video/mp4')])->assertSessionHasNoErrors();
        foreach (['before_photo', 'after_photo'] as $field) {
            $this->post('/admin/galleries/before-after', [$field => UploadedFile::fake()->image('boundary.jpg')->size(2048)])->assertSessionHasNoErrors();
            $this->postJson('/admin/galleries/before-after', [$field => UploadedFile::fake()->image('large.jpg')->size(2049)])
                ->assertUnprocessable()->assertJsonValidationErrors($field);
        }
        // Photo-video before/after and video thumbnails are NOT portfolio photo albums.
        $service->update(['slug' => 'photography-videography']);
        foreach (['before_after', 'video'] as $type) {
            $this->postJson('/admin/galleries', array_replace($payload, ['title' => $type, 'media_type' => $type, 'file_photo' => UploadedFile::fake()->image('large.jpg')->size(2049)]))
                ->assertUnprocessable()->assertJsonValidationErrors('file_photo');
        }
    }

    public function test_service_and_showreel_posters_enforce_two_mib_without_reducing_video_limit(): void
    {
        $service = Service::create(['slug' => 'test', 'name' => 'Test']);
        $payload = ['name' => 'Test', 'description' => 'Description'];
        $this->post('/admin/services/'.$service->id.'/update', $payload + ['file_photo' => UploadedFile::fake()->image('ok.jpg')->size(2048)])->assertSessionHasNoErrors();
        $this->postJson('/admin/services/'.$service->id.'/update', $payload + ['file_photo' => UploadedFile::fake()->image('large.jpg')->size(2049)])
            ->assertUnprocessable()->assertJsonValidationErrors('file_photo');
        $this->post('/admin/galleries/showreel', ['poster_photo' => UploadedFile::fake()->image('ok.jpg')->size(2048), 'video_file' => UploadedFile::fake()->create('video.mp4', 102400, 'video/mp4')])->assertSessionHasNoErrors();
        $this->postJson('/admin/galleries/showreel', ['poster_photo' => UploadedFile::fake()->image('large.jpg')->size(2049)])
            ->assertUnprocessable()->assertJsonValidationErrors('poster_photo');
    }

    public function test_avatar_file_and_camera_enforce_two_mib(): void
    {
        $this->post('/admin/profile/avatar', ['avatar_file' => UploadedFile::fake()->image('ok.jpg')->size(2048)])->assertSessionHasNoErrors();
        $this->postJson('/admin/profile/avatar', ['avatar_file' => UploadedFile::fake()->image('large.jpg')->size(2049)])
            ->assertUnprocessable()->assertJsonValidationErrors('avatar_file');
        $camera = UploadedFile::fake()->image('camera.png');
        $image = file_get_contents($camera->getPathname());
        $boundary = $image.str_repeat("\0", 2048 * 1024 - strlen($image));
        $this->post('/admin/profile/avatar', ['avatar_camera_base64' => 'data:image/png;base64,'.base64_encode($boundary)])->assertSessionHasNoErrors();
        $this->post('/admin/profile/avatar', ['avatar_camera_base64' => 'data:image/png;base64,'.base64_encode($boundary.str_repeat("\0", 1024))])->assertSessionHasErrors('avatar');
        $avatar = auth()->user()->fresh()->avatar;
        if ($avatar) { @unlink(public_path(ltrim($avatar, '/'))); }
    }

    public function test_delivery_images_have_no_size_or_resolution_limit_but_other_files_keep_one_hundred_mib(): void
    {
        $payload = ['client_name' => 'Test', 'client_username' => 'testclient', 'client_password' => 'testpass', 'title' => 'Test delivery', 'expiry_days' => 7];
        $this->postJson('/admin/client-deliveries', $payload + ['photos' => [UploadedFile::fake()->image('ok.jpg')->size(2048)]])->assertOk();
        $delivery = ClientDelivery::sole();
        foreach (['/admin/client-deliveries', '/admin/client-deliveries/'.$delivery->id.'/upload-photos'] as $url) {
            foreach ([102401, 2049] as $size) {
                $response = $this->postJson($url, $payload + ['photos' => [UploadedFile::fake()->image('original.jpg')->size($size)]])
                    ->assertOk()->assertJsonPath('success', true);
                $target = ClientDelivery::find($response->json('delivery_id') ?? $delivery->id);
                $photo = $target->photos()->latest('id')->first();
                $this->assertSame($size * 1024, (int) $photo->file_size);
                Storage::disk('public')->assertExists($photo->file_path);
            }
            // Actual image content is exempt even with a misleading filename/MIME.
            $image = UploadedFile::fake()->image('real.jpg', 4000, 1);
            $disguised = UploadedFile::fake()->createWithContent('hidden.pdf', file_get_contents($image->getPathname()))->size(102401);
            $this->postJson($url, $payload + ['photos' => [$disguised]])->assertOk();
            foreach (['application/pdf' => 'large.pdf', 'video/mp4' => 'large.mp4', 'image/jpeg' => 'pretend.jpg'] as $mime => $name) {
                $this->postJson($url, $payload + ['photos' => [UploadedFile::fake()->createWithContent($name, 'Not image content')->mimeType('text/plain')->size(102401)]])
                    ->assertUnprocessable()->assertJsonValidationErrors('photos.0');
            }
            $this->postJson($url, $payload + ['photos' => ['not a file']])
                ->assertUnprocessable()->assertJsonValidationErrors('photos.0');
            $this->postJson($url, $payload + ['photos' => [UploadedFile::fake()->image('panorama.jpg', 8000, 1)]])->assertOk();
        }
        $this->postJson('/admin/client-deliveries/'.$delivery->id.'/upload-photos', ['photos' => [
            UploadedFile::fake()->create('document.pdf', 102400, 'application/pdf'),
            UploadedFile::fake()->create('movie.mp4', 102400, 'video/mp4'),
            UploadedFile::fake()->image('boundary.jpg')->size(2048),
        ]])->assertOk()->assertJsonPath('uploaded_count', 3);
        $this->postJson('/admin/client-deliveries/'.$delivery->id.'/upload-photos', ['photos' => [UploadedFile::fake()->create('large.pdf', 102401, 'application/pdf')]])->assertUnprocessable();
    }
}
