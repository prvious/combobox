<?php

namespace Prvious\Filament\Combobox\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Prvious\Filament\Combobox\Combobox
 */
class Combobox extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Prvious\Filament\Combobox\Combobox::class;
    }
}
