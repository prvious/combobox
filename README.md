# Filament Combobox

[![Latest Version on Packagist](https://img.shields.io/packagist/v/prvious/filament-combobox.svg?style=flat-square)](https://packagist.org/packages/prvious/filament-combobox)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/prvious/filament-combobox/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/prvious/filament-combobox/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/prvious/filament-combobox/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/prvious/filament-combobox/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/prvious/filament-combobox.svg?style=flat-square)](https://packagist.org/packages/prvious/filament-combobox)

Description bla bla bla ...

## Installation

You can install the package via composer:

```bash
composer require prvious/filament-combobox
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="filament-combobox-views"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

### Basic Usage

```php
use Prvious\Filament\Combobox\Components\Combobox;

Combobox::make('status')
    ->options([
        'draft' => 'Draft',
        'published' => 'Published',
        'archived' => 'Archived',
    ])
```

### Setting a Search Query

You can set a search query that will be displayed in the search input when the component loads:

```php
Combobox::make('product')
    ->searchable()
    ->options([
        // your options
    ])
    ->searchQuery('electronics')
```

This will populate the search input with "electronics" but will not trigger a search automatically.

### Auto-Triggering a Search on Load

If you want to perform a search automatically when the component boots, use the `autoSearch()` method along with `searchQuery()`:

```php
Combobox::make('product')
    ->searchable()
    ->getSearchResultsUsing(function (string $search) {
        return Product::where('name', 'like', "%{$search}%")
            ->limit(50)
            ->pluck('name', 'id')
            ->toArray();
    })
    ->searchQuery('electronics')
    ->autoSearch()
```

This is useful when you want to pre-filter options based on context, such as:
- Showing products from a specific category
- Filtering items based on user permissions
- Displaying search results based on a related field value

You can also conditionally enable auto-search:

```php
Combobox::make('product')
    ->searchable()
    ->searchQuery($categoryName)
    ->autoSearch(filled($categoryName))
```

**Note:** The `autoSearch()` method requires that the component is searchable and has a search handler configured.

## Testing

### Unit Tests

```bash
composer test
```

### Browser Tests

The package includes comprehensive browser tests using Laravel Dusk to test the Combobox component in a real browser environment.

```bash
# Run all tests including browser tests
php vendor/bin/pest

# Run only browser tests
php vendor/bin/pest tests/Browser
```

For detailed information about browser testing, see [BROWSER_TESTING.md](BROWSER_TESTING.md).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Clovis Muneza](https://github.com/prvious)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
