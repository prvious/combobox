<?php

namespace Workbench\App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Workbench\App\Providers\Filament\AdminPanelProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->register(AdminPanelProvider::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Route::view('/', 'welcome');
    }
}
