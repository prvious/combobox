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

    protected string | Closure | null $defaultSearchQuery = null;

    protected string | Closure | null $searchQueryValue = null;

    protected bool $shouldTriggerSearch = false;

    public function defaultSearchQuery(string | Closure | null $query): static
    {
        $this->defaultSearchQuery = $query;

        return $this;
    }

    public function getDefaultSearchQuery(): ?string
    {
        return $this->evaluate($this->defaultSearchQuery);
    }

    public function searchQuery(string | Closure | null $query): static
    {
        $this->searchQueryValue = $query;
        $this->shouldTriggerSearch = true;

        return $this;
    }

    public function getSearchQueryValue(): ?string
    {
        return $this->evaluate($this->searchQueryValue);
    }

    public function shouldTriggerSearch(): bool
    {
        return $this->shouldTriggerSearch;
    }
}
