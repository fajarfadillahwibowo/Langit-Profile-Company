<?php

namespace Tests\Feature;

use App\Models\Gallery;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PhotoVideoGalleryOrderTest extends TestCase
{
    use RefreshDatabase;

    private function gallery(Service $service, string $title, array $extra = []): Gallery
    {
        return Gallery::create(array_merge([
            'service_id' => $service->id,
            'title' => $title,
            'slug' => str($title)->slug()->value(),
            'category' => 'wedding',
            'media_type' => 'photo',
            'file_webp_path' => '/storage/galleries/'.$title.'.webp',
        ], $extra));
    }

    public function test_portfolio_gallery_lists_newest_uploaded_photos_first(): void
    {
        $this->withoutVite();

        $service = Service::create([
            'slug' => 'photography-videography',
            'name' => 'Photography & Videography',
            'is_active' => true,
        ]);

        $oldest = $this->gallery($service, 'oldest');
        $middle = $this->gallery($service, 'middle');
        $newest = $this->gallery($service, 'newest');

        // created_at adalah waktu unggah: simulasikan unggahan bertingkat.
        $oldest->forceFill(['created_at' => now()->subDays(3)])->save();
        $middle->forceFill(['created_at' => now()->subDay()])->save();
        $newest->forceFill(['created_at' => now()])->save();

        $this->get(route('services.photo-video'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Services/PhotoVideoView', false)
            ->has('galleries', 3)
            ->where('galleries.0.id', $newest->id)
            ->where('galleries.1.id', $middle->id)
            ->where('galleries.2.id', $oldest->id));
    }

    public function test_photos_uploaded_in_the_same_second_are_ordered_by_newest_id_first(): void
    {
        $this->withoutVite();

        $service = Service::create([
            'slug' => 'photography-videography',
            'name' => 'Photography & Videography',
            'is_active' => true,
        ]);

        $first = $this->gallery($service, 'batch one');
        $second = $this->gallery($service, 'batch two');

        $timestamp = now()->startOfSecond();
        $first->forceFill(['created_at' => $timestamp])->save();
        $second->forceFill(['created_at' => $timestamp])->save();

        $this->get(route('services.photo-video'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('galleries', 2)
            ->where('galleries.0.id', $second->id)
            ->where('galleries.1.id', $first->id));
    }
}
