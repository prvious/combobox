<?php

namespace Prvious\Filament\Combobox;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Facades\FilamentAsset;
use Livewire\Features\SupportTesting\Testable;
use Prvious\Filament\Combobox\Testing\TestsCombobox;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ComboboxServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('prvious-combobox')
            ->hasViews();
    }

    public function packageBooted(): void
    {
        FilamentAsset::register([
            AlpineComponent::make('combobox', __DIR__ . '/../dist/components/combobox.js'),
        ], 'prvious-combobox');

        Testable::mixin(new TestsCombobox);
    }
}
