<?php

namespace Prvious\Filament\Combobox\Components;

use Closure;
use Filament\Forms\Components\Select;

class Combobox extends Select
{
    /**
     * @var view-string
     */
    protected string $view = 'prvious-combobox::components.combobox';

    protected string | Closure | null $searchQueryValue = null;

    protected bool $shouldAutoSearch = false;

    public function searchQuery(string | Closure | null $query): static
    {
        $this->searchQueryValue = $query;

        return $this;
    }

    public function getSearchQuery(): ?string
    {
        return $this->evaluate($this->searchQueryValue);
    }

    public function autoSearch(bool | Closure $condition = true): static
    {
        $this->shouldAutoSearch = $condition;

        return $this;
    }

    public function shouldAutoSearch(): bool
    {
        return $this->evaluate($this->shouldAutoSearch);
    }
}
