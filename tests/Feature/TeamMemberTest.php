<?php

namespace Tests\Feature;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeamMemberTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Test Member', 'role' => 'Developer', 'division' => 'Web',
            'bio' => null, 'skills' => 'PHP, React', 'sort_order' => 0, 'is_active' => true,
            'photo' => UploadedFile::fake()->image('portrait.jpg'),
        ], $overrides);
    }

    public function test_admin_can_create_member_with_public_photo(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post('/admin/team-members', $this->payload())->assertSessionHasNoErrors()->assertRedirect();
        $member = TeamMember::sole();
        $this->assertSame('Test Member', $member->name);
        $this->assertTrue($member->is_active);
        $this->assertSame(0, $member->sort_order);
        $this->assertStringStartsWith('team/', $member->photo_path);
        Storage::disk('public')->assertExists($member->photo_path);
        $this->assertSame(Storage::disk('public')->url($member->photo_path), $member->toArray()['photo_url']);
    }

    public function test_update_keeps_photo_when_omitted_and_replaces_it_when_uploaded(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->post('/admin/team-members', $this->payload());
        $member = TeamMember::sole();
        $old = $member->photo_path;
        $this->post('/admin/team-members/'.$member->id.'/update', $this->payload(['photo' => null, 'name' => 'Updated', 'is_active' => false]))
            ->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame('Updated', $member->refresh()->name);
        $this->assertFalse($member->is_active);
        $this->assertSame($old, $member->photo_path);
        Storage::disk('public')->assertExists($old);
        $this->post('/admin/team-members/'.$member->id.'/update', $this->payload())->assertSessionHasNoErrors()->assertRedirect();
        $this->assertNotSame($old, $member->refresh()->photo_path);
        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($member->photo_path);
    }

    public function test_delete_removes_member_and_photo(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->post('/admin/team-members', $this->payload());
        $member = TeamMember::sole();
        $this->delete('/admin/team-members/'.$member->id)->assertRedirect();
        $this->assertDatabaseMissing('team_members', ['id' => $member->id]);
        Storage::disk('public')->assertMissing($member->photo_path);
    }

    public function test_dashboard_receives_all_members_in_stable_order(): void
    {
        $this->withoutVite();
        $first = $this->member(['sort_order' => 2]);
        $second = $this->member(['sort_order' => 1, 'is_active' => false]);
        $third = $this->member(['sort_order' => 1]);
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin/dashboard')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard', false)
            ->has('teamMembers', 3)->where('teamMembers.0.id', $second->id)
            ->where('teamMembers.1.id', $third->id)->where('teamMembers.2.id', $first->id));
    }

    private function member(array $overrides = []): TeamMember
    {
        return TeamMember::create(array_replace([
            'name' => 'Test', 'role' => 'Developer', 'division' => 'Web',
            'photo_path' => 'team/test.jpg', 'sort_order' => 0, 'is_active' => true,
        ], $overrides));
    }

    public function test_clients_cannot_create_team_members(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'client']))
            ->post('/admin/team-members', $this->payload())->assertForbidden();
        $this->assertDatabaseCount('team_members', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_public_page_only_exposes_active_members_in_stable_order(): void
    {
        $this->withoutVite();
        $last = $this->member(['sort_order' => 5]);
        $this->member(['is_active' => false]);
        $first = $this->member(['sort_order' => 1]);
        $second = $this->member(['sort_order' => 1]);
        $this->get('/our-team')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Team/Index', false)->has('teamMembers', 3)
            ->where('teamMembers.0.id', $first->id)->where('teamMembers.1.id', $second->id)
            ->where('teamMembers.2.id', $last->id)->where('teamMembers.0.is_active', true)
            ->where('teamMembers.0.photo_url', Storage::disk('public')->url('team/test.jpg')));
    }

    public function test_all_mutations_require_authentication_and_admin_role(): void
    {
        Storage::fake('public');
        $member = $this->member();
        $this->post('/admin/team-members', [])->assertRedirect('/login');
        $this->post('/admin/team-members/'.$member->id.'/update', [])->assertRedirect('/login');
        $this->delete('/admin/team-members/'.$member->id)->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['role' => 'client']));
        $this->post('/admin/team-members/'.$member->id.'/update', [])->assertForbidden();
        $this->delete('/admin/team-members/'.$member->id)->assertForbidden();
        $this->assertDatabaseHas('team_members', ['id' => $member->id, 'name' => 'Test']);
    }

    public function test_superadmin_can_manage_members_and_missing_ids_return_404(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'superadmin']));
        $this->post('/admin/team-members', $this->payload())->assertSessionHasNoErrors()->assertRedirect();
        $member = TeamMember::sole();
        $this->post('/admin/team-members/'.$member->id.'/update', $this->payload(['photo' => null]))->assertRedirect();
        $this->delete('/admin/team-members/'.$member->id)->assertRedirect();
        $this->post('/admin/team-members/'.$member->id.'/update', [])->assertNotFound();
        $this->delete('/admin/team-members/'.$member->id)->assertNotFound();
    }

    public function test_create_requires_fields_and_explicit_active_boolean(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']))->postJson('/admin/team-members', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'role', 'division', 'photo', 'sort_order', 'is_active']);
        $this->assertDatabaseCount('team_members', 0);
    }

    public function test_field_limits_and_invalid_types_are_rejected_on_create_and_update(): void
    {
        Storage::fake('public');
        $member = $this->member();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach (['name' => str_repeat('a', 121), 'role' => str_repeat('a', 161),
            'division' => str_repeat('a', 101), 'bio' => str_repeat('a', 2001),
            'skills' => str_repeat('a', 501), 'sort_order' => -1, 'is_active' => 'yes'] as $field => $invalid) {
            foreach (['/admin/team-members', '/admin/team-members/'.$member->id.'/update'] as $url) {
                $this->postJson($url, $this->payload([$field => $invalid]))->assertUnprocessable()->assertJsonValidationErrors($field);
            }
        }
        $this->assertDatabaseCount('team_members', 1);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_unsafe_and_oversized_photos_cannot_replace_existing_photo(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('team/test.jpg', 'original');
        $member = $this->member();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach ([UploadedFile::fake()->create('script.php', 1, 'application/x-httpd-php'),
            UploadedFile::fake()->createWithContent('portrait.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
            UploadedFile::fake()->image('huge.jpg')->size(2049)] as $photo) {
            foreach (['/admin/team-members', '/admin/team-members/'.$member->id.'/update'] as $url) {
                $this->postJson($url, $this->payload(['photo' => $photo]))->assertUnprocessable()->assertJsonValidationErrors('photo');
            }
        }
        $this->assertSame('team/test.jpg', $member->refresh()->photo_path);
        $this->assertSame('original', Storage::disk('public')->get('team/test.jpg'));
        $this->assertSame(['team/test.jpg'], Storage::disk('public')->allFiles());
    }

    public function test_maximum_field_lengths_and_two_mib_image_are_accepted(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']))->post('/admin/team-members', $this->payload([
            'name' => str_repeat('n', 120), 'role' => str_repeat('r', 160), 'division' => str_repeat('d', 100),
            'bio' => str_repeat('b', 2000), 'skills' => str_repeat('s', 500), 'is_active' => '0',
            'photo' => UploadedFile::fake()->image('portrait.png')->size(2048),
        ]))->assertSessionHasNoErrors()->assertRedirect();
        $this->assertFalse(TeamMember::sole()->is_active);
    }

    public function test_public_team_page_is_empty_without_seeded_people(): void
    {
        $this->withoutVite();
        $this->get('/our-team')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Team/Index', false)->has('teamMembers', 0));
    }
}
