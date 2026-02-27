<?php

/**
 * Helper to build a CSS selector targeting a specific combobox field's input.
 * Uses Filament's label[for] attribute which contains the state path (e.g. "data.status").
 */
function comboboxInput(string $field): string
{
    return ".fi-fo-field:has(label[for*=\"{$field}\"]) .prvious-combobox-unified-input";
}

function comboboxOptions(string $field): string
{
    return ".fi-fo-field:has(label[for*=\"{$field}\"]) .prvious-combobox-options-wrapper";
}

function comboboxOption(string $field, string $value): string
{
    return ".fi-fo-field:has(label[for*=\"{$field}\"]) .prvious-combobox-input-option[data-value=\"{$value}\"]";
}

function comboboxMessage(string $field): string
{
    return ".fi-fo-field:has(label[for*=\"{$field}\"]) .prvious-combobox-input-message";
}

function comboboxBadges(string $field): string
{
    return ".fi-fo-field:has(label[for*=\"{$field}\"]) .prvious-combobox-input-value-badges-ctn";
}

function comboboxClearButton(string $field): string
{
    return ".fi-fo-field:has(label[for*=\"{$field}\"]) .prvious-combobox-input-value-remove-btn";
}

// ---------------------------------------------------------------------------
// Static options combobox
// ---------------------------------------------------------------------------

it('renders static options and allows selection', function () {
    $page = visit('/admin/posts/create');

    $page->click(comboboxInput('status'))
        ->assertSeeIn(comboboxOptions('status'), 'Draft')
        ->assertSeeIn(comboboxOptions('status'), 'In Review')
        ->assertSeeIn(comboboxOptions('status'), 'Published')
        ->assertSeeIn(comboboxOptions('status'), 'Archived')
        ->click(comboboxOption('status', 'published'))
        ->assertAttribute(comboboxInput('status'), 'placeholder', 'Published');
});

// ---------------------------------------------------------------------------
// Server-side search
// ---------------------------------------------------------------------------

it('searches server-side and selects a result', function () {
    $page = visit('/admin/posts/create');

    // Type slowly and wait for debounce + server response
    $page->click(comboboxInput('category_id'))
        ->typeSlowly(comboboxInput('category_id'), 'Tech')
        ->wait(3)
        ->assertSeeIn(comboboxOptions('category_id'), 'Technology')
        ->click(comboboxOption('category_id', '1'))
        ->assertAttribute(comboboxInput('category_id'), 'placeholder', 'Technology');
});

// ---------------------------------------------------------------------------
// Auto-search / static options pre-loaded
// ---------------------------------------------------------------------------

it('pre-loads options for auto-search combobox', function () {
    $page = visit('/admin/posts/create');

    // Priority field has static options — rendered immediately on mount
    $page->assertSeeIn(comboboxOptions('priority'), 'Low')
        ->assertSeeIn(comboboxOptions('priority'), 'Medium')
        ->assertSeeIn(comboboxOptions('priority'), 'High')
        ->assertSeeIn(comboboxOptions('priority'), 'Urgent');
});

// ---------------------------------------------------------------------------
// Preloaded relationship combobox
// ---------------------------------------------------------------------------

it('preloads all relationship options', function () {
    $page = visit('/admin/posts/create');

    // Preloaded options load asynchronously on mount
    $page->click(comboboxInput('preloaded_category'))
        ->wait(2)
        ->assertSeeIn(comboboxOptions('preloaded_category'), 'Technology')
        ->assertSeeIn(comboboxOptions('preloaded_category'), 'Science')
        ->assertSeeIn(comboboxOptions('preloaded_category'), 'Health');
});

// ---------------------------------------------------------------------------
// Multi-select
// ---------------------------------------------------------------------------

it('allows selecting multiple tags', function () {
    $page = visit('/admin/posts/create');

    // Search and select first tag
    $page->click(comboboxInput('tags'))
        ->typeSlowly(comboboxInput('tags'), 'Laravel')
        ->wait(3)
        ->click(comboboxOption('tags', '1'));

    // Clear search and select second tag
    $page->clear(comboboxInput('tags'))
        ->typeSlowly(comboboxInput('tags'), 'PHP')
        ->wait(3)
        ->click(comboboxOption('tags', '2'));

    // Verify both badges appear
    $page->assertSeeIn(comboboxBadges('tags'), 'Laravel')
        ->assertSeeIn(comboboxBadges('tags'), 'PHP');
});

// ---------------------------------------------------------------------------
// Multi-select maxItems enforcement
// ---------------------------------------------------------------------------

it('enforces maxItems limit on multi-select', function () {
    $page = visit('/admin/posts/create');

    // Select 3 tags (the maximum) — use type() (atomic fill) instead of
    // typeSlowly() to avoid text duplication from Livewire DOM morphing.
    $page->click(comboboxInput('tags'))
        ->typeSlowly(comboboxInput('tags'), 'Laravel')
        ->wait(3)
        ->click(comboboxOption('tags', '1'));

    $page->wait(1)
        ->click(comboboxInput('tags'))
        ->type(comboboxInput('tags'), 'PHP')
        ->wait(3)
        ->click(comboboxOption('tags', '2'));

    $page->wait(1)
        ->click(comboboxInput('tags'))
        ->type(comboboxInput('tags'), 'JavaScript')
        ->wait(3)
        ->click(comboboxOption('tags', '3'));

    // Verify 3 badges
    $page->assertCount(comboboxBadges('tags') . ' .fi-badge', 3);

    // Try selecting a 4th — the alert() is auto-dismissed by Playwright
    $page->wait(1)
        ->click(comboboxInput('tags'))
        ->type(comboboxInput('tags'), 'Vue')
        ->wait(3)
        ->click(comboboxOption('tags', '5'));

    // Should still only have 3 badges (Vue was rejected)
    $page->assertCount(comboboxBadges('tags') . ' .fi-badge', 3);
});

// ---------------------------------------------------------------------------
// Removing a multi-select badge
// ---------------------------------------------------------------------------

it('removes a tag when its badge delete button is clicked', function () {
    $page = visit('/admin/posts/create');

    // Select two tags
    $page->click(comboboxInput('tags'))
        ->typeSlowly(comboboxInput('tags'), 'Laravel')
        ->wait(3)
        ->click(comboboxOption('tags', '1'));

    $page->clear(comboboxInput('tags'))
        ->typeSlowly(comboboxInput('tags'), 'PHP')
        ->wait(3)
        ->click(comboboxOption('tags', '2'));

    $page->assertSeeIn(comboboxBadges('tags'), 'Laravel')
        ->assertSeeIn(comboboxBadges('tags'), 'PHP');

    // Remove first badge
    $page->click(comboboxBadges('tags') . ' .fi-badge[data-value="1"] .fi-badge-delete-btn')
        ->assertDontSeeIn(comboboxBadges('tags'), 'Laravel')
        ->assertSeeIn(comboboxBadges('tags'), 'PHP');
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

it('navigates options with arrow keys and selects with Enter', function () {
    $page = visit('/admin/posts/create');

    $page->click(comboboxInput('status'))
        ->assertSeeIn(comboboxOptions('status'), 'Draft');

    // ArrowDown moves focus from search input to first option, Enter selects it
    $page->keys(comboboxInput('status'), ['ArrowDown', 'Enter']);

    $page->assertAttribute(comboboxInput('status'), 'placeholder', 'Draft');
});

// ---------------------------------------------------------------------------
// Search filtering (client-side)
// ---------------------------------------------------------------------------

it('filters static options by search query', function () {
    $page = visit('/admin/posts/create');

    $page->click(comboboxInput('status'))
        ->assertSeeIn(comboboxOptions('status'), 'Draft')
        ->typeSlowly(comboboxInput('status'), 'pub')
        ->assertVisible(comboboxOption('status', 'published'))
        ->assertMissing(comboboxOption('status', 'draft'))
        ->assertMissing(comboboxOption('status', 'review'))
        ->assertMissing(comboboxOption('status', 'archived'));
});

// ---------------------------------------------------------------------------
// Clear button removes selection
// ---------------------------------------------------------------------------

it('clears selection when clear button is clicked', function () {
    $page = visit('/admin/posts/create');

    // Select an option
    $page->click(comboboxInput('status'))
        ->click(comboboxOption('status', 'published'))
        ->assertVisible(comboboxClearButton('status'));

    // Click clear
    $page->click(comboboxClearButton('status'))
        ->assertMissing(comboboxClearButton('status'));
});

// ---------------------------------------------------------------------------
// Custom search prompt placeholder
// ---------------------------------------------------------------------------

it('renders the icon combobox with prefix icon', function () {
    $page = visit('/admin/posts/create');

    // The icon_category combobox has a prefixIcon configured — verify the icon SVG renders
    $page->assertPresent('.fi-fo-field:has(label[for*="icon_category"]) .fi-input-wrp-prefix svg');
});

// ---------------------------------------------------------------------------
// No results message
// ---------------------------------------------------------------------------

it('shows no results message for non-matching search', function () {
    $page = visit('/admin/posts/create');

    $page->click(comboboxInput('icon_category'))
        ->typeSlowly(comboboxInput('icon_category'), 'xyznonexistent')
        ->wait(3)
        ->assertSeeIn(comboboxMessage('icon_category'), 'No categories found.');
});

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------

it('submits the form with combobox values and creates a post', function () {
    $page = visit('/admin/posts/create');

    // Fill title using Filament's wire:model input
    $page->type('.fi-fo-field:has(label[for*="title"]) input', 'My Browser Test Post');

    // Select status
    $page->click(comboboxInput('status'))
        ->click(comboboxOption('status', 'published'));

    // Select priority
    $page->click(comboboxInput('priority'))
        ->click(comboboxOption('priority', 'high'))
        ->wait(1);

    // Submit the form — target the primary action button
    $page->click('button.fi-color-primary')
        ->wait(5)
        ->assertSee('Created');
});
