<?php

use Laravel\Dusk\Browser;
use Workbench\App\Models\User;

test('user can login to admin panel', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser
            ->visit('/admin/login')
            ->type('input[type="email"]', $user->email)
            ->type('input[type="password"]', 'password')
            ->press('Sign in')
            ->waitForLocation('/admin')
            ->assertSee('Dashboard');
    });
});

test('user can access user resource', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser
            ->visit('/admin/login')
            ->type('input[type="email"]', $user->email)
            ->type('input[type="password"]', 'password')
            ->press('Sign in')
            ->waitForLocation('/admin')
            ->visit('/admin/users')
            ->assertSee('Users');
    });
});

test('user can create new user with combobox field', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser
            ->visit('/admin/login')
            ->type('input[type="email"]', $user->email)
            ->type('input[type="password"]', 'password')
            ->press('Sign in')
            ->waitForLocation('/admin')
            ->visit('/admin/users/create')
            ->assertSee('Create user')
            ->type('input[name="name"]', 'John Doe')
            ->type('input[name="email"]', 'john@example.com')
            ->screenshot('before-combobox-interaction')
            ->click('[data-field-wrapper-id="data.role"]')
            ->waitFor('[data-field-wrapper-id="data.role"] [role="listbox"]')
            ->screenshot('combobox-dropdown-open')
            ->click('[data-field-wrapper-id="data.role"] [role="option"]:first-child')
            ->screenshot('combobox-option-selected')
            ->type('input[name="password"]', 'password123')
            ->press('Create')
            ->waitForLocation('/admin/users')
            ->screenshot('user-created')
            ->assertSee('John Doe');
    });
});

test('combobox field is searchable', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser
            ->visit('/admin/login')
            ->type('input[type="email"]', $user->email)
            ->type('input[type="password"]', 'password')
            ->press('Sign in')
            ->waitForLocation('/admin')
            ->visit('/admin/users/create')
            ->click('[data-field-wrapper-id="data.role"]')
            ->waitFor('[data-field-wrapper-id="data.role"] input[type="search"]')
            ->screenshot('combobox-search-visible')
            ->type('[data-field-wrapper-id="data.role"] input[type="search"]', 'admin')
            ->screenshot('combobox-search-typed')
            ->assertSee('Administrator');
    });
});
