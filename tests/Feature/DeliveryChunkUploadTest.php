<?php
namespace Tests\Feature;

use App\Models\{User, ClientDelivery, ClientPhoto};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeliveryChunkUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_two_hundred_originals_are_acknowledged_once_despite_replayed_requests(): void
    {
        Storage::fake('public'); Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->postJson('/admin/client-deliveries', ['client_name'=>'Test','client_username'=>'chunkclient','client_password'=>'pass','title'=>'Originals','expiry_days'=>7])->assertOk();
        $delivery = ClientDelivery::sole();
        $image = UploadedFile::fake()->image('original.jpg', 4000, 1);
        $bytes = file_get_contents($image->getPathname());
        for ($i=0; $i<200; $i++) {
            $uuid = (string) Str::uuid();
            $url = "/admin/client-deliveries/{$delivery->id}/uploads/{$uuid}";
            $meta = ['name'=>'original.jpg','size'=>strlen($bytes),'chunks'=>1];
            $this->postJson($url, $meta)->assertOk();
            $chunk = ['index'=>0,'sha256'=>hash('sha256',$bytes),'chunk'=>UploadedFile::fake()->createWithContent('chunk.bin',$bytes)];
            $this->postJson($url.'/chunks', $chunk)->assertOk();
            $this->postJson($url.'/chunks', $chunk)->assertOk();
            $this->postJson($url.'/complete')->assertOk()->assertJsonPath('total_photos', $i+1);
            $this->postJson($url.'/complete')->assertOk()->assertJsonPath('total_photos', $i+1);
        }
        $this->assertSame(200, ClientPhoto::count());
        $photo = ClientPhoto::first();
        $this->assertSame($bytes, Storage::disk('public')->get($photo->file_path));
    }

    public function test_original_larger_than_one_hundred_mib_is_reassembled_without_byte_changes(): void
    {
        Storage::fake('public'); Storage::fake('local');
        $this->actingAs(User::factory()->create(['role'=>'admin']));
        $this->postJson('/admin/client-deliveries', ['client_name'=>'Test','client_username'=>'largeoriginal','client_password'=>'pass','title'=>'Large','expiry_days'=>7])->assertOk();
        $delivery = ClientDelivery::sole();
        $url = '/admin/client-deliveries/'.$delivery->id.'/uploads/'.Str::uuid();
        $size = 101 * 1024 * 1024;
        $this->postJson($url, ['name'=>'original.jpg','size'=>$size,'chunks'=>13])->assertOk();
        $image = UploadedFile::fake()->image('large.jpg');
        $header = file_get_contents($image->getPathname());
        $hash = hash_init('sha256');
        for ($index=0; $index<13; $index++) {
            $length = min(8*1024*1024, $size-$index*8*1024*1024);
            $bytes = $index === 0 ? $header.str_repeat("\0", $length-strlen($header)) : str_repeat("\0", $length);
            hash_update($hash, $bytes);
            $this->postJson($url.'/chunks', ['index'=>$index, 'sha256'=>hash('sha256',$bytes), 'chunk'=>UploadedFile::fake()->createWithContent('chunk.bin',$bytes)])->assertOk();
        }
        $this->postJson($url.'/complete')->assertOk()->assertJsonPath('total_photos',1);
        $photo = ClientPhoto::sole();
        $this->assertSame($size, $photo->file_size);
        $this->assertSame(hash_final($hash), hash_file('sha256', Storage::disk('public')->path($photo->file_path)));
    }

    public function test_expired_private_chunks_are_pruned_but_live_sessions_remain(): void
    {
        Storage::fake('public'); Storage::fake('local');
        $admin = User::factory()->create(['role'=>'admin']); $this->actingAs($admin);
        $this->postJson('/admin/client-deliveries', ['client_name'=>'Test','client_username'=>'cleanup','client_password'=>'pass','title'=>'Test','expiry_days'=>7])->assertOk();
        $delivery = ClientDelivery::sole();
        $uuid = (string) Str::uuid();
        $this->postJson('/admin/client-deliveries/'.$delivery->id.'/uploads/'.$uuid, ['name'=>'x.jpg','size'=>1,'chunks'=>1])->assertOk();
        Storage::disk('local')->put('delivery_uploads/'.$uuid.'/0.part','x');
        $this->artisan('delivery-uploads:prune')->assertSuccessful();
        Storage::disk('local')->assertExists('delivery_uploads/'.$uuid.'/0.part');
        \Illuminate\Support\Facades\DB::table('delivery_uploads')->where('id',$uuid)->update(['expires_at'=>now()->subDay()]);
        $this->artisan('delivery-uploads:prune')->assertSuccessful();
        Storage::disk('local')->assertMissing('delivery_uploads/'.$uuid.'/0.part');
        $this->assertDatabaseMissing('delivery_uploads',['id'=>$uuid]);
    }

    public function test_metadata_creation_is_idempotent_and_scoped_to_the_admin(): void
    {
        $this->actingAs(User::factory()->create(['role'=>'admin']));
        $payload = ['creation_uuid'=>(string) Str::uuid(), 'client_name'=>'Test','client_username'=>'metadata','client_password'=>'pass','title'=>'Originals','expiry_days'=>7];
        $first = $this->postJson('/admin/client-deliveries', $payload)->assertOk();
        $this->postJson('/admin/client-deliveries', $payload)->assertOk()->assertJsonPath('delivery_id', $first->json('delivery_id'));
        $this->assertSame(1, ClientDelivery::count());
        $this->actingAs(User::factory()->create(['role'=>'admin']));
        $this->postJson('/admin/client-deliveries', $payload)->assertNotFound();
    }

    public function test_scope_validation_recovery_and_large_file_metadata(): void
    {
        Storage::fake('public'); Storage::fake('local');
        $admin = User::factory()->create(['role'=>'admin']); $this->actingAs($admin);
        $delivery = ClientDelivery::create(['user_id'=>$admin->id,'client_name'=>'Test','client_email'=>'test@example.test','title'=>'Test','expired_at'=>now()->addDay()]);
        $url = '/admin/client-deliveries/'.$delivery->id.'/uploads/'.Str::uuid();
        $this->postJson($url,['name'=>'../escape.jpg','size'=>10,'chunks'=>1])->assertUnprocessable();
        $this->postJson($url,['name'=>'huge.jpg','size'=>150*1024*1024,'chunks'=>19])->assertOk();
        $this->postJson($url.'/complete')->assertStatus(409);
        $this->actingAs(User::factory()->create(['role'=>'admin']));
        $this->postJson($url.'/complete')->assertNotFound();
        $this->actingAs(User::factory()->create(['role'=>'client']));
        $this->postJson($url.'/complete')->assertForbidden();
        auth()->logout(); $this->postJson($url.'/complete')->assertUnauthorized();
        $this->actingAs($admin);
        $url2 = '/admin/client-deliveries/'.$delivery->id.'/uploads/'.Str::uuid();
        $image = UploadedFile::fake()->image('x.jpg');
        $bytes = file_get_contents($image->getPathname());
        $this->postJson($url2,['name'=>'x.jpg','size'=>strlen($bytes),'chunks'=>1])->assertOk();
        $this->postJson($url2.'/chunks',['index'=>0,'sha256'=>str_repeat('0',64),'chunk'=>UploadedFile::fake()->createWithContent('c',$bytes)])->assertUnprocessable();
        $this->postJson($url2.'/complete')->assertStatus(409);
        $this->postJson($url2.'/chunks',['index'=>0,'sha256'=>hash('sha256',$bytes),'chunk'=>UploadedFile::fake()->createWithContent('c',$bytes)])->assertOk();
        $this->postJson($url2.'/complete')->assertOk()->assertJsonPath('total_photos',1);
        $this->postJson('/admin/client-deliveries/'.$delivery->id.'/uploads/not-a-uuid',[])->assertUnprocessable();
    }

    public function test_superadmin_can_upload_and_complete_chunks(): void
    {
        Storage::fake('public'); Storage::fake('local');
        $superadmin = User::factory()->create(['role' => 'superadmin']);
        $this->actingAs($superadmin);
        $delivery = ClientDelivery::create(['user_id' => $superadmin->id, 'client_name' => 'Super', 'client_email' => 'super@example.test', 'title' => 'Super', 'expired_at' => now()->addDay()]);
        $url = '/admin/client-deliveries/' . $delivery->id . '/uploads/' . Str::uuid();
        $image = UploadedFile::fake()->image('super.jpg');
        $bytes = file_get_contents($image->getPathname());
        $this->postJson($url, ['name' => 'super.jpg', 'size' => strlen($bytes), 'chunks' => 1])->assertOk();
        $this->postJson($url . '/chunks', ['index' => 0, 'sha256' => hash('sha256', $bytes), 'chunk' => UploadedFile::fake()->createWithContent('c', $bytes)])->assertOk();
        $this->postJson($url . '/complete')->assertOk()->assertJsonPath('total_photos', 1);
        $this->assertSame(1, ClientPhoto::count());
    }

    public function test_client_role_cannot_access_admin_dashboard_or_deliveries(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $this->actingAs($client);
        $this->get('/admin/dashboard')->assertRedirect(route('client.gallery'));
        $this->postJson('/admin/client-deliveries', [
            'creation_uuid' => (string) Str::uuid(),
            'client_name' => 'Test',
            'client_username' => 'testuser',
            'client_password' => 'secret',
            'title' => 'Test Title',
            'expiry_days' => 7,
        ])->assertForbidden();
    }
}
