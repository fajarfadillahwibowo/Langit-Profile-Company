<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;

class TeamMemberController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [new Middleware(function (Request $request, \Closure $next) {
            abort_unless(in_array($request->user()?->role, ['admin', 'superadmin'], true), 403);

            return $next($request);
        })];
    }

    private function validated(Request $request, bool $creating): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['required', 'string', 'max:160'],
            'division' => ['required', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'skills' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'photo' => [$creating ? 'required' : 'nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $member = TeamMember::findOrFail($id);
        $data = $this->validated($request, false);
        $oldPhoto = $member->photo_path;
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('team', 'public');
        }
        unset($data['photo']);
        $member->update($data);
        if ($member->photo_path !== $oldPhoto) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return redirect()->route('admin.dashboard')->with('success', 'Anggota tim berhasil diperbarui.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $member = TeamMember::findOrFail($id);
        $photo = $member->photo_path;
        $member->delete();
        Storage::disk('public')->delete($photo);

        return redirect()->route('admin.dashboard')->with('success', 'Anggota tim berhasil dihapus.');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request, true);
        $data['photo_path'] = $request->file('photo')->store('team', 'public');
        unset($data['photo']);
        TeamMember::create($data);

        return redirect()->route('admin.dashboard')->with('success', 'Anggota tim berhasil ditambahkan.');
    }
}
