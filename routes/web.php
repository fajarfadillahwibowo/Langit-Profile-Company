<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ClientPortalController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InteractiveActionController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Visitor Portal Routes (PRD Section 8.1)
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');

// 7 Distinct Adaptive Service Views
Route::prefix('layanan')->group(function () {
    Route::get('/photography-videography', [ServiceController::class, 'photoVideo'])->name('services.photo-video');
    Route::get('/web-development', [ServiceController::class, 'webDev'])->name('services.web-dev');
    Route::get('/langit-education', [ServiceController::class, 'education'])->name('services.education');
    Route::get('/computer-service', [ServiceController::class, 'computerService'])->name('services.computer-service');
    Route::get('/internship', [ServiceController::class, 'internship'])->name('services.internship');
    Route::get('/magang-pkl', fn () => redirect()->route('services.internship'));
    Route::get('/sewa-alat', [ServiceController::class, 'sewaAlat'])->name('services.sewa-alat');
    Route::get('/kolaborasi', [ServiceController::class, 'kolaborasi'])->name('services.kolaborasi');
    Route::get('/konsultasi', fn () => redirect()->route('consultation.wizard'))->name('services.konsultasi');
});

// Main Topbar Direct Pages
Route::get('/portofolio', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/our-team', [\App\Http\Controllers\TeamController::class, 'index'])->name('team.index');
Route::get('/internship', fn () => redirect()->route('services.internship'));
Route::get('/kontak', [ContactController::class, 'index'])->name('contact.index');
Route::get('/konsultasi', [ConsultationController::class, 'wizard'])->name('consultation.wizard');

// Unified Login Portal (Admin & Pelanggan Jadi Satu)
Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Portal Pelanggan (Ambil Foto & Galeri)
Route::prefix('pelanggan')->name('client.')->group(function () {
    Route::get('/login', fn () => redirect()->route('login'))->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.post');
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    Route::get('/galeri', [ClientPortalController::class, 'gallery'])->name('gallery');
    Route::get('/foto/{id}/preview', [ClientPortalController::class, 'previewPhoto'])->name('photo.preview');
    Route::get('/foto/{id}/download', [ClientPortalController::class, 'downloadPhoto'])->name('photo.download');
    Route::get('/album/{id}/download-all', [ClientPortalController::class, 'downloadAllZip'])->name('album.download-all');
});

// Interactive Action Endpoints (Public)
Route::get('/api/service-tracker/{receipt_number}', [InteractiveActionController::class, 'serviceTracker'])->name('api.service-tracker');
Route::post('/sewa-alat/checkout', [InteractiveActionController::class, 'rentalCheckout'])->name('rental.checkout');
Route::post('/internship/apply', [InteractiveActionController::class, 'internshipApply'])->name('internship.apply');
Route::post('/kolaborasi/submit', [InteractiveActionController::class, 'collaborationSubmit'])->name('collaboration.submit');
Route::post('/konsultasi/book', [InteractiveActionController::class, 'consultationBook'])->name('consultation.book');
Route::post('/education/register', [InteractiveActionController::class, 'educationRegister'])->name('education.register');

/*
|--------------------------------------------------------------------------
| Admin Portal & CMS Back-Office Routes (PRD Section 8.2)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', fn () => redirect()->route('login'))->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
});

Route::prefix('admin')->name('admin.')->group(function () {

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::post('/team-members', [\App\Http\Controllers\Admin\TeamMemberController::class, 'store'])->name('team-members.store');
        Route::post('/team-members/{id}/update', [\App\Http\Controllers\Admin\TeamMemberController::class, 'update'])->name('team-members.update');
        Route::delete('/team-members/{id}', [\App\Http\Controllers\Admin\TeamMemberController::class, 'destroy'])->name('team-members.destroy');

        // Computer Service Tickets
        Route::post('/tickets', [AdminDashboardController::class, 'createTicket'])->name('tickets.create');
        Route::put('/tickets/{id}/status', [AdminDashboardController::class, 'updateTicketStatus'])->name('tickets.update-status');
        Route::put('/tickets/{id}', [AdminDashboardController::class, 'updateTicket'])->name('tickets.update');
        Route::delete('/tickets/{id}', [AdminDashboardController::class, 'deleteTicket'])->name('tickets.delete');

        // Rental Equipment & Bookings
        Route::put('/rentals/{id}/status', [AdminDashboardController::class, 'updateRentalBookingStatus'])->name('rentals.update-status');
        Route::put('/rentals/{id}', [AdminDashboardController::class, 'updateRentalBooking'])->name('rentals.update');
        Route::delete('/rentals/{id}', [AdminDashboardController::class, 'deleteRentalBooking'])->name('rentals.delete');
        Route::post('/equipments', [AdminDashboardController::class, 'createEquipment'])->name('equipments.create');
        Route::put('/equipments/{id}', [AdminDashboardController::class, 'updateEquipment'])->name('equipments.update');
        Route::delete('/equipments/{id}', [AdminDashboardController::class, 'deleteEquipment'])->name('equipments.delete');

        // Galleries & Photos
        Route::post('/galleries/before-after', [AdminDashboardController::class, 'updateBeforeAfter'])->name('galleries.before-after');
        Route::post('/galleries/showreel', [AdminDashboardController::class, 'updateShowreel'])->name('galleries.showreel');
        Route::post('/galleries', [AdminDashboardController::class, 'createGallery'])->name('galleries.create');
        Route::put('/galleries/{id}', [AdminDashboardController::class, 'updateGallery'])->name('galleries.update');
        Route::post('/galleries/{id}/update', [AdminDashboardController::class, 'updateGallery'])->name('galleries.update-post');
        Route::delete('/galleries/{id}', [AdminDashboardController::class, 'deleteGallery'])->name('galleries.delete');

        // Internships
        Route::put('/internships/{id}/status', [AdminDashboardController::class, 'updateApplicationStatus'])->name('internships.update-status');
        Route::put('/internships/{id}', [AdminDashboardController::class, 'updateInternshipApplication'])->name('internships.update');
        Route::delete('/internships/{id}', [AdminDashboardController::class, 'deleteInternshipApplication'])->name('internships.delete');

        // Consultations
        Route::put('/consultations/{id}/status', [AdminDashboardController::class, 'updateConsultationStatus'])->name('consultations.update-status');
        Route::put('/consultations/{id}', [AdminDashboardController::class, 'updateConsultation'])->name('consultations.update');
        Route::delete('/consultations/{id}', [AdminDashboardController::class, 'deleteConsultation'])->name('consultations.delete');

        // Collaborations (Kemitraan & Proposal Kerja Sama)
        Route::put('/collaborations/{id}/status', [AdminDashboardController::class, 'updateCollaborationStatus'])->name('collaborations.update-status');
        Route::put('/collaborations/{id}', [AdminDashboardController::class, 'updateCollaboration'])->name('collaborations.update');
        Route::delete('/collaborations/{id}', [AdminDashboardController::class, 'deleteCollaboration'])->name('collaborations.delete');

        // Services Management (Kartu 7 Divisi Layanan)
        Route::put('/services/{id}', [AdminDashboardController::class, 'updateService'])->name('services.update');
        Route::post('/services/{id}/update', [AdminDashboardController::class, 'updateService'])->name('services.update-post');

        Route::post('/client-deliveries/{id}/uploads/{upload}', [\App\Http\Controllers\Admin\DeliveryUploadController::class, 'start']);
        Route::post('/client-deliveries/{id}/uploads/{upload}/chunks', [\App\Http\Controllers\Admin\DeliveryUploadController::class, 'chunk']);
        Route::post('/client-deliveries/{id}/uploads/{upload}/complete', [\App\Http\Controllers\Admin\DeliveryUploadController::class, 'complete']);

        // Layanan Pengambilan Foto Pelanggan (Client Deliveries)
        Route::post('/client-deliveries', [AdminDashboardController::class, 'createClientDelivery'])->name('client-deliveries.create');
        Route::post('/client-deliveries/{id}/upload-photos', [AdminDashboardController::class, 'uploadAdditionalClientPhotos'])->name('client-deliveries.upload-photos');
        Route::put('/client-deliveries/{id}/expiry', [AdminDashboardController::class, 'updateDeliveryExpiry'])->name('client-deliveries.update-expiry');
        Route::put('/client-deliveries/{id}/credentials', [AdminDashboardController::class, 'updateClientCredentials'])->name('client-deliveries.update-credentials');
        Route::delete('/client-photos/{id}', [AdminDashboardController::class, 'deleteClientPhoto'])->name('client-photos.delete');
        Route::delete('/client-deliveries/{id}', [AdminDashboardController::class, 'deleteClientDelivery'])->name('client-deliveries.delete');

        // Admin Profile Management & Live Camera / Upload Avatar
        Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [AdminProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/avatar', [AdminProfileController::class, 'uploadAvatar'])->name('profile.avatar.upload');
        Route::delete('/profile/avatar', [AdminProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');
    });
});
