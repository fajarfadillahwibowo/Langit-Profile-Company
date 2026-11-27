<?php

namespace Tests\Feature;

use Illuminate\Console\Scheduling\Schedule;
use Tests\TestCase;

class AutomaticStorageCleanupScheduleTest extends TestCase
{
    public function test_automatic_storage_cleanup_is_blocked_by_default(): void
    {
        $this->assertFalse(config('filesystems.automatic_cleanup_enabled'));
        $this->assertFalse(config('filesystems.client_delivery_auto_purge_enabled'));

        $this->artisan('schedule:list')->assertSuccessful();

        $events = $this->app->make(Schedule::class)->events();
        $this->assertCount(3, $events);
        foreach ($events as $event) {
            $this->assertFalse($event->filtersPass($this->app), $event->command);
        }
    }

    public function test_automatic_storage_cleanup_requires_explicit_opt_in(): void
    {
        config([
            'filesystems.automatic_cleanup_enabled' => true,
            'filesystems.client_delivery_auto_purge_enabled' => true,
        ]);

        $this->artisan('schedule:list')->assertSuccessful();

        $events = $this->app->make(Schedule::class)->events();
        $this->assertCount(3, $events);
        foreach ($events as $event) {
            $this->assertTrue($event->filtersPass($this->app), $event->command);
        }
    }

    public function test_expired_album_cleanup_can_run_without_enabling_other_destructive_tasks(): void
    {
        config([
            'filesystems.automatic_cleanup_enabled' => false,
            'filesystems.client_delivery_auto_purge_enabled' => true,
        ]);

        $this->artisan('schedule:list')->assertSuccessful();

        $events = $this->app->make(Schedule::class)->events();
        $this->assertCount(3, $events);
        foreach ($events as $event) {
            $isExpiredAlbumPurge = str_contains($event->command, 'deliveries:purge-expired');
            $this->assertSame($isExpiredAlbumPurge, $event->filtersPass($this->app), $event->command);
        }
    }
}
