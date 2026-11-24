<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $pendingRequestsCount = 0;
        $customerBadges = [
            'hasScanned' => false,
            'matchedCount' => 0,
            'cartCount' => 0,
            'readyDownloadsCount' => 0,
        ];

        if ($user) {
            if (in_array($user->role, ['admin', 'superadmin'], true)) {
                $pendingRequestsCount = \App\Models\AiPhotoRequest::where('status', 'WAITING_MANUAL_PAYMENT')->count();
            } elseif ($user->role === 'customer') {
                $matchedIds = $request->session()->get('matched_photo_ids');
                $cartIds = $request->session()->get('customer_cart_ids', []);
                $customerBadges = [
                    'hasScanned' => is_array($matchedIds),
                    'matchedCount' => is_array($matchedIds) ? count($matchedIds) : 0,
                    'cartCount' => is_array($cartIds) ? count($cartIds) : 0,
                    'readyDownloadsCount' => \App\Models\AiPhotoRequest::where('customer_id', $user->id)
                        ->where('status', 'SENT_BY_ADMIN')
                        ->count(),
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'sidebarBadges' => [
                'pendingRequestsCount' => $pendingRequestsCount,
                ...$customerBadges,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
