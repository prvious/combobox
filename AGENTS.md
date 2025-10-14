# Agent Instructions

## Project Context

FilamentPHP combobox form field package (`prvious/filament-combobox`)

-   Composer package for Filament Panel v3+
-   PHP 8.1+, Laravel service provider architecture
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

## Important Notes

-   Never commit built assets to version control
-   Follow Filament form field patterns
-   Check existing Filament components for API consistency
-   Use Filament's asset registration system
