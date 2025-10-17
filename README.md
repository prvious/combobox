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

### Setting a Default Search Query

You can set a default search query that will be displayed in the search input when the component loads. This does not trigger a search; it simply sets the default value:

```php
Combobox::make('product')
    ->searchable()
    ->options([
        // your options
    ])
    ->defaultSearchQuery('electronics')
```

### Triggering a Search on Load

If you want to perform a search automatically when the component boots, use the `searchQuery()` method. This will populate the search input with the query and trigger a search using your search handler:

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
```

This is useful when you want to pre-filter options based on context, such as:
- Showing products from a specific category
- Filtering items based on user permissions
- Displaying search results based on a related field value

**Note:** The `searchQuery()` method requires that the component is searchable and has a search handler configured.

## Testing

```bash
composer test
```

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
