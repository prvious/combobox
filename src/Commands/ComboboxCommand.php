<?php

namespace Prvious\Filament\Combobox\Commands;

use Illuminate\Console\Command;

class ComboboxCommand extends Command
{
    public $signature = 'filament-combobox';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
