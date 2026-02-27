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
- **NEVER** modify the Playwright/PestPHP timeout configuration in `tests/Pest.php`

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4.18

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan

- Use the `list-artisan-commands` tool when you need to call an Artisan command to double-check the available parameters.

## URLs

- Whenever you share a project URL with the user, you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain/IP, and port.

## Tinker / Debugging

- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.
- Use the `database-schema` tool to inspect table structure before writing migrations or models.

## Reading Browser Logs With the `browser-logs` Tool

- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)

- Boost comes with a powerful `search-docs` tool you should use before trying other approaches when working with Laravel or Laravel ecosystem packages. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic-based queries at once. For example: `['rate limiting', 'routing rate limiting', 'routing']`. The most relevant results will be returned first.
- Do not add package names to queries; package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'.
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit".
3. Quoted Phrases (Exact Position) - query="infinite scroll" - words must be adjacent and in that order.
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit".
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms.

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.

## Constructors

- Use PHP 8 constructor property promotion in `__construct()`.
    - `public function __construct(public GitHub $github) { }`
- Do not allow empty `__construct()` methods with zero parameters unless the constructor is private.

## Type Declarations

- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<!-- Explicit Return Types and Method Params -->
```php
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
```

## Enums

- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

## Comments

- Prefer PHPDoc blocks over inline comments. Never use comments within the code itself unless the logic is exceptionally complex.

## PHPDoc Blocks

- Add useful array shape type definitions when appropriate.

</laravel-boost-guidelines>
