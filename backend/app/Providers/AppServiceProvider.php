<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Return plain arrays/objects instead of Laravel's default
        // {"data": ...} envelope, to match the frontend's API contract.
        JsonResource::withoutWrapping();

        // This app is API-only and has no "login" web route to redirect
        // to, so unauthenticated requests should always get a 401 JSON
        // response instead of Laravel's default redirect attempt.
        Authenticate::redirectUsing(fn () => null);
    }
}
