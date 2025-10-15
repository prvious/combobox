# Copilot Instructions

## Context

FilamentPHP v4 combobox form field package for Laravel

- Use `composer install`, `php artisan serve`, `vendor/bin/pest`
- Never run bare commands like `composer` or `php` - always use `d`

## Code Style

- PHP 8.2+ with typed properties and return types
- Follow Laravel Pint configuration in `pint.json`
- No docblocks for simple type-hinted methods
- Use Filament naming conventions

## Testing

- Write Pest tests in `tests/`
- Test command: `composer test`
- Lint command: `composer lint`

## Frontend

- Alpine.js for interactivity
- Tailwind CSS for styling
- Build: `pnpm build`
- Follow Filament's component patterns

## Key Rules

1. Check Filament docs for field API patterns
2. Namespace: `Prvious\Filament\Combobox`
3. Register assets via `ComboboxServiceProvider`
4. Never hardcode paths - use Laravel helpers
5. Maintain backward compatibility in minor versions
