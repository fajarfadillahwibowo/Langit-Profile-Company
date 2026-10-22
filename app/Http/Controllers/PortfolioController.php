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
        $galleries = Gallery::all();

        return Inertia::render('Portfolio/Index', [
            'galleries' => $galleries,
        ]);
    }
}
