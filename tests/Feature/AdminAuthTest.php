<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/admin/login');

        $response->assertStatus(200);
    }

    public function test_admin_can_authenticate_using_the_login_screen(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->post('/admin/login', [
            'email' => 'admin@langit.id',
            'password' => 'admin123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_cannot_authenticate_with_invalid_password(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->post('/admin/login', [
            'email' => 'admin@langit.id',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }
}
