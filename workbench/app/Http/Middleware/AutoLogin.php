<?php

namespace Workbench\App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Workbench\App\Models\User;

class AutoLogin
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (! Auth::check()) {
            $user = User::where('email', 'admin@example.com')->first();

            if ($user) {
                Auth::login($user);
            }
        }

        return $next($request);
    }
}
