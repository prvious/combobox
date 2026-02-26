# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`prvious/filament-combobox` — A combobox/autocomplete form field package for FilamentPHP v4+ (Laravel). The main component (`Combobox`) extends Filament's `Select` with a custom Alpine.js frontend and Tailwind CSS styling.

## Commands

```bash
# PHP
composer test              # Run Pest tests
composer test-coverage     # Tests with coverage
composer format            # Format PHP with Laravel Pint
composer lint              # Lint PHP (Pint, parallel)
composer serve             # Start workbench dev server

# Frontend assets
pnpm build                 # Build JS (esbuild) + CSS (PostCSS)
pnpm dev                   # Watch mode for JS development
pnpm build:css             # Build CSS only
```

Never commit built assets in `resources/dist/`.

## Architecture

- **`src/Components/Combobox.php`** — Main PHP component. Extends `Filament\Forms\Components\Select`, adding `searchQuery()` and `autoSearch()` methods. Uses Filament's chainable fluent API with `Closure`-evaluated properties.
- **`src/ComboboxServiceProvider.php`** — Registers Alpine component JS, CSS assets, and views via Filament's asset system (`FilamentAsset::register`). Package name: `prvious-combobox`.
- **`resources/js/components/combobox.js`** — Alpine.js component (~1,700 lines). Handles keyboard navigation, search debouncing, multi-select, option grouping, and Livewire integration via `$wire.callSchemaComponentMethod()`.
- **`resources/css/components/combobox.css`** — PostCSS with nesting. Uses `prvious-*` class prefix. Supports light/dark mode.
- **`resources/views/components/combobox.blade.php`** — Blade template. Renders native `<select>` for simple cases, Alpine component for interactive cases.
- **`workbench/`** — Development environment (Orchestra Testbench). Contains demo models, Filament resources, migrations, and seeders for manual testing via `composer serve`.

## Code Conventions

- **PHP**: PHP 8.2+, typed properties/returns, PSR-4 namespace `Prvious\Filament\Combobox`, Laravel Pint with `laravel` preset (`pint.json`)
- **JS**: No semicolons, single quotes, trailing commas (Prettier config in `.prettierrc`)
- **CSS**: PostCSS nesting, `prvious-*` class prefix, Tailwind CSS variables for theming
- Follow Filament's form field API patterns — check existing Filament components for consistency
