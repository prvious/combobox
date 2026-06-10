<?php

namespace Workbench\App\Providers;

use Illuminate\Support\ServiceProvider;
use Workbench\App\Providers\Filament\AdminPanelProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(AdminPanelProvider::class);
    }

    public function boot(): void
    {
        //
    }
}
