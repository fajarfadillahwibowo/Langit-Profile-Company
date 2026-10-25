<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminProfileController;
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
});

// Main Topbar Direct Pages
Route::get('/portofolio', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/internship', fn () => redirect()->route('services.internship'));
Route::get('/kontak', [ContactController::class, 'index'])->name('contact.index');
Route::get('/konsultasi', [ConsultationController::class, 'wizard'])->name('consultation.wizard');

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
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
});

// Fallback named route for standard Laravel auth redirection
Route::get('/login', fn () => redirect()->route('admin.login'))->name('login');

Route::prefix('admin')->name('admin.')->group(function () {

    Route::middleware('auth')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Computer Service Tickets
        Route::post('/tickets', [AdminDashboardController::class, 'createTicket'])->name('tickets.create');
        Route::put('/tickets/{id}/status', [AdminDashboardController::class, 'updateTicketStatus'])->name('tickets.update-status');
        Route::put('/tickets/{id}', [AdminDashboardController::class, 'updateTicket'])->name('tickets.update');
        Route::delete('/tickets/{id}', [AdminDashboardController::class, 'deleteTicket'])->name('tickets.delete');

        // Rental Equipment & Bookings
        Route::put('/rentals/{id}/status', [AdminDashboardController::class, 'updateRentalBookingStatus'])->name('rentals.update-status');
        Route::put('/rentals/{id}', [AdminDashboardController::class, 'updateRentalBooking'])->name('rentals.update');
        Route::delete('/rentals/{id}', [AdminDashboardController::class, 'deleteRentalBooking'])->name('rentals.delete');
        Route::put('/equipments/{id}', [AdminDashboardController::class, 'updateEquipment'])->name('equipments.update');

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

        // Admin Profile Management & Live Camera / Upload Avatar
        Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [AdminProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/avatar', [AdminProfileController::class, 'uploadAvatar'])->name('profile.avatar.upload');
        Route::delete('/profile/avatar', [AdminProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');
    });
});
