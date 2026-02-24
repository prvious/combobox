<?php

namespace Workbench\App\Filament\Resources;

use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Prvious\Filament\Combobox\Components\Combobox;
use Workbench\App\Filament\Resources\PostResource\Pages;
use Workbench\App\Models\Category;
use Workbench\App\Models\Post;
use Workbench\App\Models\Tag;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-document-text';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Info')
                    ->columns(2)
                    ->components([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        // 1. Searchable single-select (server-side search)
                        Combobox::make('category_id')
                            ->label('Category (Server Search)')
                            ->helperText('Searchable combobox with server-side search')
                            ->searchable()
                            ->getSearchResultsUsing(fn (string $search): array =>
                                Category::where('name', 'like', "%{$search}%")
                                    ->limit(50)
                                    ->pluck('name', 'id')
                                    ->toArray()
                            )
                            ->getOptionLabelUsing(fn ($value): ?string =>
                                Category::find($value)?->name
                            ),

                        // 2. Static options combobox (no search needed)
                        Combobox::make('status')
                            ->label('Status (Static Options)')
                            ->helperText('Combobox with pre-defined static options')
                            ->searchable()
                            ->options([
                                'draft' => 'Draft',
                                'review' => 'In Review',
                                'published' => 'Published',
                                'archived' => 'Archived',
                            ])
                            ->default('draft'),
                    ]),

                Section::make('Advanced Combobox Examples')
                    ->columns(2)
                    ->components([
                        // 3. Auto-search combobox (pre-fills search + auto-executes)
                        Combobox::make('priority')
                            ->label('Priority (Auto-Search)')
                            ->helperText('Uses searchQuery() + autoSearch() to pre-load results')
                            ->searchable()
                            ->searchQuery('') // empty string triggers loading all
                            ->autoSearch()
                            ->options([
                                'low' => 'Low',
                                'medium' => 'Medium',
                                'high' => 'High',
                                'urgent' => 'Urgent',
                            ]),

                        // 4. Preloaded relationship combobox
                        Combobox::make('preloaded_category')
                            ->label('Category (Preloaded)')
                            ->helperText('Uses preload() to eagerly fetch all options')
                            ->searchable()
                            ->preload()
                            ->relationship('category', 'name')
                            ->dehydrated(false),

                        // 5. Multi-select with maxItems
                        Combobox::make('tags')
                            ->label('Tags (Max 3)')
                            ->helperText('Multi-select with maxItems(3) limit')
                            ->multiple()
                            ->searchable()
                            ->maxItems(3)
                            ->relationship('tags', 'name')
                            ->getSearchResultsUsing(fn (string $search): array =>
                                Tag::where('name', 'like', "%{$search}%")
                                    ->limit(50)
                                    ->pluck('name', 'id')
                                    ->toArray()
                            )
                            ->getOptionLabelsUsing(fn (array $values): array =>
                                Tag::whereIn('id', $values)->pluck('name', 'id')->toArray()
                            ),

                        // 6. Combobox with prefix icon and custom placeholder
                        Combobox::make('icon_category')
                            ->label('Category (With Icon)')
                            ->helperText('Combobox with prefixIcon and custom messages')
                            ->searchable()
                            ->prefixIcon('heroicon-o-tag')
                            ->searchPrompt('Type to find a category...')
                            ->noSearchResultsMessage('No categories found.')
                            ->searchingMessage('Looking for categories...')
                            ->loadingMessage('Fetching categories...')
                            ->searchDebounce(500)
                            ->getSearchResultsUsing(fn (string $search): array =>
                                Category::where('name', 'like', "%{$search}%")
                                    ->limit(50)
                                    ->pluck('name', 'id')
                                    ->toArray()
                            )
                            ->getOptionLabelUsing(fn ($value): ?string =>
                                Category::find($value)?->name
                            )
                            ->dehydrated(false),
                    ]),

                Section::make('Content')
                    ->components([
                        Forms\Components\Textarea::make('content')
                            ->rows(5),

                        Forms\Components\Toggle::make('published')
                            ->default(false),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable(),
                Tables\Columns\TextColumn::make('category.name'),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'review' => 'warning',
                        'published' => 'success',
                        'archived' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('priority')->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'low' => 'gray',
                        'medium' => 'info',
                        'high' => 'warning',
                        'urgent' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\IconColumn::make('published')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
