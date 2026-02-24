<?php

namespace Workbench\App\Filament\Resources\PostResource\Pages;

use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\HtmlString;
use Prvious\Filament\Combobox\Components\Combobox;
use Workbench\App\Filament\Resources\PostResource;
use Workbench\App\Models\Tag;

class ListPosts extends ListRecords
{
    protected static string $resource = PostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('tagBrowser')
                ->label('Browse Tags')
                ->icon('heroicon-o-tag')
                ->slideOver()
                ->modalHeading('Browse & Select Tags')
                ->modalDescription('This combobox spans the full available height of the sidebar.')
                ->modalWidth('md')
                ->modalContentFooter(new HtmlString(
                    '<style>.fi-modal-slide-over .prvious-combobox-options-wrapper { max-height: calc(100vh - 18rem) !important; }</style>'
                ))
                ->form([
                    Combobox::make('selected_tags')
                        ->label('Tags')
                        ->multiple()
                        ->searchable()
                        ->searchQuery('')
                        ->autoSearch()
                        ->preload()
                        ->getSearchResultsUsing(
                            fn (string $search): array => Tag::where('name', 'like', "%{$search}%")
                                ->limit(50)
                                ->pluck('name', 'id')
                                ->toArray()
                        )
                        ->getOptionLabelsUsing(
                            fn (array $values): array => Tag::whereIn('id', $values)->pluck('name', 'id')->toArray()
                        )
                        ->options(
                            Tag::pluck('name', 'id')->toArray()
                        ),
                ])
                ->modalSubmitActionLabel('Apply Tags')
                ->action(function (array $data): void {
                    // Just a demo — no actual action needed
                }),

            Actions\CreateAction::make(),
        ];
    }
}
