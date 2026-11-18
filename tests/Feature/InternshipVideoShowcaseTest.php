<?php

namespace Tests\Feature;

use App\Models\Gallery;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InternshipVideoShowcaseTest extends TestCase
{
    use RefreshDatabase;

    private function service(string $slug, string $name): Service
    {
        return Service::firstOrCreate(['slug' => $slug], ['name' => $name, 'is_active' => true]);
    }

    public function test_internship_page_receives_showreel_and_photo_galleries_separately(): void
    {
        $this->withoutVite();

        $internship = $this->service('internship', 'Internship');
        $photoVideo = $this->service('photography-videography', 'Photography & Videography');

        $photo = Gallery::create([
            'service_id' => $internship->id,
            'title' => 'Suasana Onsite Magang',
            'slug' => 'suasana-onsite-magang',
            'category' => 'event',
            'media_type' => 'photo',
            'file_webp_path' => '/storage/galleries/onsite.webp',
        ]);

        $showreel = Gallery::create([
            'service_id' => $internship->id,
            'title' => 'Internship Showcase',
            'slug' => 'internship-showcase',
            'category' => 'showreel',
            'media_type' => 'video',
            'file_webp_path' => '/storage/galleries/poster.webp',
            'video_url' => '/uploads/videos/internship.mp4',
        ]);

        // Showreel milik layanan lain tidak boleh bocor ke halaman magang.
        Gallery::create([
            'service_id' => $photoVideo->id,
            'title' => 'Cinema Showreel',
            'slug' => 'cinema-showreel',
            'category' => 'showreel',
            'media_type' => 'video',
            'file_webp_path' => '/storage/galleries/cinema.webp',
            'video_url' => '/uploads/videos/cinema.mp4',
        ]);

        $this->get(route('services.internship'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Services/InternshipView', false)
            ->where('showreel.id', $showreel->id)
            ->where('showreel.video_url', '/uploads/videos/internship.mp4')
            ->has('galleries', 1)
            ->where('galleries.0.id', $photo->id));
    }

    public function test_admin_uploads_internship_showreel_without_touching_photography_showreel(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));

        $internship = $this->service('internship', 'Internship');
        $photoVideo = $this->service('photography-videography', 'Photography & Videography');

        $cinema = Gallery::create([
            'service_id' => $photoVideo->id,
            'title' => 'Cinema Showreel',
            'slug' => 'cinema-showreel',
            'category' => 'showreel',
            'media_type' => 'video',
            'file_webp_path' => '/storage/galleries/cinema.webp',
            'video_url' => '/uploads/videos/cinema.mp4',
        ]);

        $this->post('/admin/galleries/showreel', [
            'service_slug' => 'internship',
            'video_file' => UploadedFile::fake()->create('internship.mp4', 2048, 'video/mp4'),
            'title' => 'Internship & Career Showcase Video',
            'subtitle' => 'Sinematik karya talenta magang.',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $internshipShowreel = Gallery::where('service_id', $internship->id)
            ->where('category', 'showreel')
            ->sole();

        $this->assertSame('video', $internshipShowreel->media_type);
        $this->assertStringStartsWith('/uploads/videos/showreel_', $internshipShowreel->video_url);

        $cinema->refresh();
        $this->assertSame('/uploads/videos/cinema.mp4', $cinema->video_url);

        $internship->refresh();
        $this->assertSame($internshipShowreel->video_url, $internship->hero_config_json['showreel_video'] ?? null);

        $photoVideo->refresh();
        $this->assertArrayNotHasKey('showreel_video', $photoVideo->hero_config_json ?? []);
    }

    public function test_deleting_internship_showreel_resets_service_hero_config(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));

        $internship = $this->service('internship', 'Internship');
        $internship->update(['hero_config_json' => [
            'showreel_video' => '/uploads/videos/internship.mp4',
            'showreel_title' => 'Internship Showcase',
        ]]);

        $showreel = Gallery::create([
            'service_id' => $internship->id,
            'title' => 'Internship Showcase',
            'slug' => 'internship-showcase',
            'category' => 'showreel',
            'media_type' => 'video',
            'file_webp_path' => '/storage/galleries/poster.webp',
            'video_url' => 'https://example.com/internship.mp4',
        ]);

        $this->delete('/admin/galleries/'.$showreel->id)->assertRedirect();

        $this->assertDatabaseMissing('galleries', ['id' => $showreel->id]);
        $internship->refresh();
        $this->assertArrayNotHasKey('showreel_video', $internship->hero_config_json ?? []);
    }

    public function test_showreel_upload_rejects_unknown_service_slug(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));

        $this->post('/admin/galleries/showreel', [
            'service_slug' => 'web-development',
            'video_url' => 'https://example.com/video.mp4',
        ])->assertSessionHasErrors('service_slug');
    }
}
