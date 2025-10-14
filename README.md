# This is my package filament-combobox

[![Latest Version on Packagist](https://img.shields.io/packagist/v/prvious/filament-combobox.svg?style=flat-square)](https://packagist.org/packages/prvious/filament-combobox)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/prvious/filament-combobox/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/prvious/filament-combobox/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/prvious/filament-combobox/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/prvious/filament-combobox/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/prvious/filament-combobox.svg?style=flat-square)](https://packagist.org/packages/prvious/filament-combobox)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require prvious/filament-combobox
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-combobox-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-combobox-config"
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

```php
$combobox = new Prvious\Filament\Combobox();
echo $combobox->echoPhrase('Hello, Prvious!');
```

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

-   [Clovis Muneza](https://github.com/prvious)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
