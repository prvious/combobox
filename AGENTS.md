# Agent Instructions

## Project Context

FilamentPHP combobox form field package (`prvious/filament-combobox`)

-   Composer package for Filament Panel v3+
-   PHP 8.2+, Laravel service provider architecture
-   Frontend: Alpine.js components with Tailwind CSS

## Key Conventions

-   Follow PSR-4 autoloading (`Prvious\Filament\Combobox` namespace)
-   Use Laravel Pint for code style (`d composer format`)
-   Run PHPStan for static analysis (`d composer analyse`)
-   Test with Pest (`d composer test`)
-   All linting: `d composer lint`

## File Structure

-   `src/` - Main package code
-   `resources/js/` - Alpine.js components
-   `resources/css/` - Tailwind styles
-   `resources/dist/` - Built assets
-   `workbench/` - Development environment
-   Build assets: `d pnpm build`

## Docker Environment

-   **ALWAYS prefix commands with `d`** - All terminal/CLI commands must use the `d` function
-   Examples: `d composer install`, `d php artisan migrate`, `d pnpm install`, `d vendor/bin/pest`
-   The `d` function handles Docker container execution automatically

## Important Notes

-   Never commit built assets to version control
-   Follow Filament form field patterns
-   Check existing Filament components for API consistency
-   Use Filament's asset registration system
