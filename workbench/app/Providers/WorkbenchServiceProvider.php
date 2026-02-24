<?php

namespace Workbench\App\Providers;

use Illuminate\Support\ServiceProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(\Workbench\App\Providers\Filament\AdminPanelProvider::class);
    }

    public function boot(): void
    {
        //
    }
}
