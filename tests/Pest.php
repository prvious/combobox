<?php

use Prvious\Filament\Combobox\Tests\BrowserTestCase;
use Prvious\Filament\Combobox\Tests\TestCase;

uses(TestCase::class);
uses(BrowserTestCase::class)->in('Browser');

pest()->browser();
