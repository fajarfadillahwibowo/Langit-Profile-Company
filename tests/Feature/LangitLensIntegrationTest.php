<?php

namespace Tests\Feature;

use App\Models\AiPhoto;
use App\Models\AiPhotoFace;
use App\Models\AiPhotoRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LangitLensIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_langitlens_admin_and_customer_scan_flow_work_inside_langit(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $admin = User::factory()->create([
            'username' => 'admin',
            'role' => 'admin',
        ]);

        // 1. Registrasi mandiri pelanggan scan kamera (min 8 karakter password + verifikasi OTP 6 digit)
        $this->post('/register', [
            'username' => 'pelangganscan',
            'email' => 'scan@langit.id',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect('/register/verify-otp');

        $pending = session('pending_registration');
        $this->assertNotEmpty($pending['otp']);

        $this->post('/register/verify-otp', [
            'otp' => $pending['otp'],
        ])->assertRedirect('/scan-foto');

        $customer = User::where('username', 'pelangganscan')->firstOrFail();
        $this->assertEquals('customer', $customer->role);
        $this->assertEquals(1, $customer->free_photo_quota);

        // 2. Seluruh halaman sub-menu Admin LangitLens harus HTTP 200
        foreach (['/admin/langitlens', '/admin/langitlens/photos', '/admin/langitlens/requests', '/admin/langitlens/customers'] as $url) {
            $this->actingAs($admin)->get($url)->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->has('adminPortal.metrics')
                    ->has('adminPortal.services')
                    ->has('adminPortal.galleries')
                    ->has('adminPortal.teamMembers')
                );
        }

        // 3. Admin upload 2 foto
        $emb = array_fill(0, 128, 0.08);
        $photoIds = [];
        for ($i = 0; $i < 2; $i++) {
            $res = $this->actingAs($admin)->postJson('/admin/langitlens/photos', [
                'photo' => UploadedFile::fake()->image("langit_ai_{$i}.jpg", 1200, 900),
                'price' => 25000,
                'faces' => json_encode([
                    [
                        'face_embedding' => $emb,
                        'bounding_box' => ['x' => 0.2, 'y' => 0.2, 'width' => 0.3, 'height' => 0.3],
                        'confidence_score' => 0.99,
                    ],
                ]),
            ]);
            $res->assertOk();
            $photoIds[] = $res->json('photo.id');
        }

        $this->assertEquals(2, AiPhoto::count());
        $this->assertEquals(2, AiPhotoFace::count());

        AiPhoto::query()->update(['original_size_bytes' => 1024, 'preview_size_bytes' => 256]);

        $this->actingAs($admin)->get('/admin/langitlens')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/LangitLens/Dashboard')
                ->where('stats.totalPhotos', 2)
                ->where('stats.totalIndexedFaces', 2)
                ->where('stats.completedRequests', 0)
                ->where('stats.totalOriginalBytes', 2048)
                ->where('stats.totalPreviewBytes', 512)
            );

        $this->actingAs($admin)->get('/admin/langitlens/photos')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/LangitLens/Photos')
                ->where('photos.total', 2)
                ->has('photos.data', 2)
                ->where('photos.data.0.face_count', 1)
            );

        // 4. Pelanggan akses halaman scan & melakukan pencarian wajah 3 sudut
        $this->actingAs($customer)->get('/scan-foto')->assertOk();
        $this->actingAs($customer)->postJson('/scan-foto/search', [
            'face_embeddings' => [
                'front' => $emb,
                'left' => $emb,
                'right' => $emb,
            ],
        ])->assertOk()->assertJsonPath('matchedCount', 2);

        $this->actingAs($customer)->get('/scan-foto/hasil')->assertOk();

        // 5. Pelanggan klaim 1 foto gratis pilihannya -> langsung terbuka & tidak bisa klaim ke-2
        $this->actingAs($customer)
            ->post("/scan-foto/hasil/{$photoIds[0]}/claim-free")
            ->assertRedirect('/scan-foto/unduhan');

        $customer->refresh();
        $this->assertEquals(0, $customer->free_photo_quota);

        $this->actingAs($customer)
            ->post("/scan-foto/hasil/{$photoIds[1]}/claim-free")
            ->assertSessionHas('error');

        // 6. Admin atur QRIS & rekening bank
        $this->actingAs($admin)->post('/admin/langitlens/discount', [
            'is_active' => true,
            'min_photos_selected' => 5,
            'discount_percentage' => 20,
            'default_photo_price' => 25000,
            'admin_whatsapp' => '6281234567890',
            'bank_name' => 'BCA',
            'bank_account_number' => '8877665544',
            'bank_account_holder' => 'Langit Creative Studio',
            'qris_image' => UploadedFile::fake()->image('qris_langit.png', 500, 500),
        ])->assertRedirect();

        // 7. Pelanggan pilih foto ke-2 ke keranjang & uji validasi bukti pembayaran (wajib & maks 5 MB)
        $this->actingAs($customer)
            ->post('/scan-foto/keranjang/toggle', ['photo_id' => $photoIds[1]])
            ->assertRedirect();

        $this->actingAs($customer)->get('/scan-foto/keranjang')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ScanFoto/Cart')
                ->where('discountRule.bank_name', 'BCA')
                ->where('discountRule.bank_account_number', '8877665544')
                ->whereNot('discountRule.qris_image_url', null)
            );

        // Tanpa bukti foto -> ditolak
        $this->actingAs($customer)
            ->post('/scan-foto/pesanan', [
                'payment_method' => 'qris',
                'customer_notes' => 'Sudah bayar via QRIS',
            ])
            ->assertSessionHasErrors('payment_proof');

        // File > 5 MB -> ditolak
        $this->actingAs($customer)
            ->post('/scan-foto/pesanan', [
                'payment_method' => 'qris',
                'customer_notes' => 'Sudah bayar via QRIS',
                'payment_proof' => UploadedFile::fake()->create('bukti_besar.png', 5200, 'image/png'),
            ])
            ->assertSessionHasErrors('payment_proof');

        // Kirim dengan bukti foto valid (bebas format foto <= 5 MB) -> sukses
        $this->actingAs($customer)
            ->post('/scan-foto/pesanan', [
                'payment_method' => 'qris',
                'customer_notes' => 'Sudah bayar via QRIS atas nama Pelanggan Scan',
                'payment_proof' => UploadedFile::fake()->image('bukti_qris.webp', 800, 1200),
            ])
            ->assertRedirect('/scan-foto/unduhan');

        $paidReq = AiPhotoRequest::where('customer_id', $customer->id)
            ->where('status', 'WAITING_MANUAL_PAYMENT')
            ->firstOrFail();

        $this->assertEquals('qris', $paidReq->payment_method);
        $this->assertNotNull($paidReq->payment_proof_path);
        Storage::disk('local')->assertExists($paidReq->payment_proof_path);

        // Pelanggan pemilik boleh lihat buktinya sendiri; pelanggan lain ditolak (403)
        $this->actingAs($customer)
            ->get("/scan-foto/unduhan/{$paidReq->id}/bukti-bayar")
            ->assertOk();

        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($otherCustomer)
            ->get("/scan-foto/unduhan/{$paidReq->id}/bukti-bayar")
            ->assertForbidden();

        // 8. Admin melihat bukti bayar pelanggan lalu konfirmasi & kirim foto asli tanpa watermark
        $this->actingAs($admin)
            ->get("/admin/langitlens/requests/{$paidReq->id}/payment-proof")
            ->assertOk();

        $this->actingAs($admin)
            ->post("/admin/langitlens/requests/{$paidReq->id}/send-originals")
            ->assertRedirect();

        $paidReq->refresh();
        $this->assertEquals('SENT_BY_ADMIN', $paidReq->status);
        $this->assertNotNull($paidReq->payment_confirmed_at);
        $this->assertTrue((bool) $paidReq->items()->first()->is_original_unlocked);
    }

    public function test_customer_can_register_and_login_with_google_socialite(): void
    {
        config([
            'services.google.client_id' => 'test-google-client-id',
            'services.google.client_secret' => 'test-google-client-secret',
        ]);

        $socialiteUser = new \Laravel\Socialite\Two\User();
        $socialiteUser->map([
            'id' => 'google-uid-999888',
            'name' => 'Budi Google',
            'email' => 'budi.google@gmail.com',
            'avatar' => 'https://lh3.googleusercontent.com/a/default-user',
        ]);

        $provider = \Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
        $provider->shouldReceive('setHttpClient')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        // 1. Akun Google BELUM terdaftar mencoba MASUK (/login) -> DITOLAK & diarahkan ke /register
        $this->withSession(['google_auth_mode' => 'login'])
            ->get('/auth/google/callback')
            ->assertRedirect('/register')
            ->assertSessionHas('error');

        $this->assertGuest();
        $this->assertNull(User::where('email', 'budi.google@gmail.com')->first());

        // 2. Akun Google BELUM terdaftar melakukan DAFTAR (/register) -> akun dibuat & otomatis masuk ke /scan-foto
        $this->withSession(['google_auth_mode' => 'register'])
            ->get('/auth/google/callback')
            ->assertRedirect('/scan-foto');

        $googleCustomer = User::where('email', 'budi.google@gmail.com')->firstOrFail();
        $this->assertEquals('google-uid-999888', $googleCustomer->google_id);
        $this->assertEquals('customer', $googleCustomer->role);
        $this->assertEquals('budi_google', $googleCustomer->username);
        $this->assertEquals(1, $googleCustomer->free_photo_quota);
        $this->assertAuthenticatedAs($googleCustomer);

        // 3. Logout lalu coba DAFTAR ulang dengan akun Google yang SUDAH terdaftar -> diarahkan ke /login
        $this->post('/logout');
        $this->withSession(['google_auth_mode' => 'register'])
            ->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error');
        $this->assertGuest();

        // 4. MASUK dengan akun Google yang SUDAH terdaftar -> berhasil masuk ke /scan-foto
        $this->withSession(['google_auth_mode' => 'login'])
            ->get('/auth/google/callback')
            ->assertRedirect('/scan-foto');
        $this->assertAuthenticatedAs($googleCustomer);
    }

    public function test_login_rate_limiting_and_last_login_tracking(): void
    {
        $user = User::create([
            'name' => 'Pelanggan Limit',
            'username' => 'pelanggan_limit',
            'email' => 'limit@example.com',
            'password' => bcrypt('Password123'),
            'role' => 'customer',
        ]);

        // 5x salah password
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'login' => 'pelanggan_limit',
                'password' => 'SalahTerus1',
            ])->assertSessionHasErrors('login');
        }

        // Percobaan ke-6 harus terkena rate limiter
        $this->post('/login', [
            'login' => 'pelanggan_limit',
            'password' => 'Password123',
        ])->assertSessionHasErrors('login');
        $this->assertGuest();

        // Login akun lain yang valid -> mencatat last_login_at & last_login_ip
        $validUser = User::create([
            'name' => 'Pelanggan Valid',
            'username' => 'pelanggan_valid',
            'email' => 'valid@example.com',
            'password' => bcrypt('Password123'),
            'role' => 'customer',
        ]);

        $this->post('/login', [
            'login' => 'pelanggan_valid',
            'password' => 'Password123',
        ])->assertRedirect('/scan-foto');

        $validUser->refresh();
        $this->assertNotNull($validUser->last_login_at);
        $this->assertNotNull($validUser->last_login_ip);
    }

    public function test_strong_password_otp_max_attempts_and_resend_cooldown(): void
    {
        // Password tanpa huruf (hanya angka) harus ditolak
        $this->post('/register', [
            'username' => 'lemah_user',
            'email' => 'lemah@example.com',
            'password' => '12345678',
            'password_confirmation' => '12345678',
        ])->assertSessionHasErrors('password');

        // Password kuat (huruf + angka, min 8 karakter) diterima
        $this->post('/register', [
            'username' => 'kuat_user',
            'email' => 'kuat@example.com',
            'password' => 'Rahasia123',
            'password_confirmation' => 'Rahasia123',
        ])->assertRedirect('/register/verify-otp');

        // Kirim ulang langsung harus ditolak oleh cooldown 60 detik
        $this->post('/register/resend-otp')
            ->assertSessionHas('error');

        // 5x salah OTP -> OTP otomatis hangus (null)
        for ($i = 0; $i < 5; $i++) {
            $this->post('/register/verify-otp', ['otp' => '000000'])
                ->assertSessionHasErrors('otp');
        }

        $pending = session('pending_registration');
        $this->assertNull($pending['otp']);
    }

    public function test_forgot_and_reset_password_via_email_otp(): void
    {
        $user = User::create([
            'name' => 'Pelanggan Lupa',
            'username' => 'pelanggan_lupa',
            'email' => 'lupa@example.com',
            'password' => bcrypt('OldPass123'),
            'role' => 'customer',
        ]);

        $this->get('/forgot-password')->assertOk();

        $this->post('/forgot-password/send-otp', [
            'email' => 'lupa@example.com',
        ])->assertRedirect('/forgot-password/reset');

        $resetSession = session('password_reset_otp');
        $this->assertNotEmpty($resetSession['otp']);

        // Reset dengan OTP valid & password baru kuat
        $this->post('/forgot-password/reset', [
            'otp' => $resetSession['otp'],
            'password' => 'NewPass456',
            'password_confirmation' => 'NewPass456',
        ])->assertRedirect('/login')->assertSessionHas('success');

        // Pastikan bisa login dengan password baru
        $this->post('/login', [
            'login' => 'lupa@example.com',
            'password' => 'NewPass456',
        ])->assertRedirect('/scan-foto');

        $this->assertAuthenticatedAs($user);
    }

    public function test_customer_can_change_password_in_profile(): void
    {
        $user = User::create([
            'name' => 'Pelanggan Profil',
            'username' => 'pelanggan_profil',
            'email' => 'profil@example.com',
            'password' => bcrypt('CurrentPass1'),
            'role' => 'customer',
        ]);

        // Password lama salah -> error
        $this->actingAs($user)
            ->put('/scan-foto/profil/password', [
                'current_password' => 'SalahPass1',
                'password' => 'BaruPass99',
                'password_confirmation' => 'BaruPass99',
            ])->assertSessionHasErrors('current_password');

        // Password lama benar & password baru kuat -> sukses
        $this->actingAs($user)
            ->put('/scan-foto/profil/password', [
                'current_password' => 'CurrentPass1',
                'password' => 'BaruPass99',
                'password_confirmation' => 'BaruPass99',
            ])->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('BaruPass99', $user->password));
    }

    public function test_admin_can_delete_customer_account_but_not_admin(): void
    {
        $admin = User::create([
            'name' => 'Admin Utama',
            'username' => 'admin_del_test',
            'email' => 'admin.del@langit.local',
            'password' => bcrypt('AdminPass123'),
            'role' => 'admin',
            'is_admin' => true,
        ]);

        $customer = User::create([
            'name' => 'Pelanggan Duplikat',
            'username' => 'duplikat_user',
            'email' => 'duplikat@example.com',
            'password' => bcrypt('CustomerPass1'),
            'role' => 'customer',
        ]);

        // Admin tidak boleh terhapus lewat endpoint Pelanggan Scan
        $this->actingAs($admin)
            ->delete("/admin/langitlens/customers/{$admin->id}")
            ->assertSessionHas('error');
        $this->assertNotNull(User::find($admin->id));

        // Pelanggan berhasil dihapus
        $this->actingAs($admin)
            ->delete("/admin/langitlens/customers/{$customer->id}")
            ->assertSessionHas('success');
        $this->assertNull(User::find($customer->id));
    }

    public function test_customer_face_scan_persists_permanently_across_logout_login_and_new_uploads(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $admin = User::factory()->create([
            'username' => 'admin_persist',
            'role' => 'admin',
        ]);

        $customer = User::create([
            'name' => 'Pelanggan Permanen',
            'username' => 'pelanggan_permanen',
            'email' => 'permanen@example.com',
            'password' => bcrypt('Password123'),
            'role' => 'customer',
        ]);

        $emb = array_fill(0, 128, 0.08);

        // 1. Admin unggah 1 foto awal
        $this->actingAs($admin)->postJson('/admin/langitlens/photos', [
            'photo' => UploadedFile::fake()->image('event_1.jpg', 1200, 900),
            'price' => 25000,
            'faces' => json_encode([
                [
                    'face_embedding' => $emb,
                    'bounding_box' => ['x' => 0.2, 'y' => 0.2, 'width' => 0.3, 'height' => 0.3],
                    'confidence_score' => 0.99,
                ],
            ]),
        ])->assertOk();

        // 2. Pelanggan login pertama kali -> diarahkan ke /scan-foto karena belum pernah scan
        $this->post('/logout');
        $this->post('/login', [
            'login' => 'pelanggan_permanen',
            'password' => 'Password123',
        ])->assertRedirect('/scan-foto');

        // 3. Pelanggan melakukan scan 3 arah wajah 1 kali saja
        $this->postJson('/scan-foto/search', [
            'face_embeddings' => [
                'front' => $emb,
                'left' => $emb,
                'right' => $emb,
            ],
        ])->assertOk()->assertJsonPath('matchedCount', 1);

        $this->assertEquals(1, \App\Models\AiFaceScan::where('customer_id', $customer->id)->count());

        // 4. Pelanggan LOGOUT (session terhapus total) lalu LOGIN kembali
        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();

        // Setelah login ulang, langsung diarahkan ke /scan-foto/hasil (tidak perlu scan lagi)
        $this->post('/login', [
            'login' => 'pelanggan_permanen',
            'password' => 'Password123',
        ])->assertRedirect('/scan-foto/hasil');

        // Halaman Foto Saya & Keranjang langsung terbuka dengan data permanen dari database
        $this->get('/scan-foto/hasil')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ScanFoto/MatchedPhotos')
                ->has('photos', 1)
                ->where('sidebarBadges.hasScanned', true)
                ->where('sidebarBadges.matchedCount', 1)
                ->where('savedScan.angles_count', 3)
            );

        // Halaman Scan Wajah menampilkan status tersimpan permanen
        $this->get('/scan-foto')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ScanFoto/FaceScan')
                ->where('hasPreviousScan', true)
                ->where('lastMatchedCount', 1)
                ->where('savedScan.angles_count', 3)
            );

        // Mencoba kirim /scan-foto/search lagi tidak membuat duplikat scan
        $this->postJson('/scan-foto/search', [
            'face_embeddings' => [
                'front' => $emb,
                'left' => $emb,
                'right' => $emb,
            ],
        ])->assertOk()->assertJsonPath('alreadyScanned', true);
        $this->assertEquals(1, \App\Models\AiFaceScan::where('customer_id', $customer->id)->count());

        // 5. Admin mengunggah foto ke-2 di kemudian hari -> otomatis muncul di Foto Saya tanpa scan ulang
        $this->actingAs($admin)->postJson('/admin/langitlens/photos', [
            'photo' => UploadedFile::fake()->image('event_2.jpg', 1200, 900),
            'price' => 25000,
            'faces' => json_encode([
                [
                    'face_embedding' => $emb,
                    'bounding_box' => ['x' => 0.2, 'y' => 0.2, 'width' => 0.3, 'height' => 0.3],
                    'confidence_score' => 0.99,
                ],
            ]),
        ])->assertOk();

        $this->actingAs($customer)->get('/scan-foto/hasil')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ScanFoto/MatchedPhotos')
                ->has('photos', 2)
                ->where('sidebarBadges.matchedCount', 2)
            );
    }
}
