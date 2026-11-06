<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\WebPortfolio;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index()
    {
        // Default urutan foto terbaru (latest)
        $galleries = Gallery::latest('created_at')->latest('id')->get();

        return Inertia::render('Portfolio/Index', [
            'galleries' => $galleries,
        ]);
    }
}
