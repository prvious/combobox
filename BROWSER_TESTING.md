# Browser Testing

This package includes browser tests using Laravel Dusk to test the Combobox component in a real browser environment.

## Requirements

- PHP 8.2+
- Chrome/Chromium browser
- ChromeDriver (automatically managed by Dusk)

## Running Browser Tests Locally

### 1. Install Dependencies

```bash
composer install
```

### 2. Install/Update ChromeDriver

```bash
php vendor/bin/dusk-updater detect --auto-update
```

### 3. Setup Database

```bash
php vendor/bin/testbench migrate:fresh
```

### 4. Start the Test Server

In one terminal, start the Testbench server:

```bash
php vendor/bin/testbench serve
```

The server will start at `http://127.0.0.1:8000`

### 5. Run Browser Tests

In another terminal, run the browser tests:

```bash
php vendor/bin/pest tests/Browser
```

## Screenshots

Browser tests automatically capture screenshots during key interactions:

- `before-combobox-interaction.png` - Form state before interacting with combobox
- `combobox-dropdown-open.png` - Combobox dropdown opened with options
- `combobox-option-selected.png` - After selecting an option
- `combobox-search-visible.png` - Search input visible
- `combobox-search-typed.png` - After typing in search
- `user-created.png` - Final state after creating user

Screenshots are saved to `tests/Browser/screenshots/`

## GitHub Actions

Browser tests run automatically on every push and pull request. Screenshots from failed tests are uploaded as artifacts.

To view screenshots from CI:
1. Go to the Actions tab
2. Select the workflow run
3. Download the `browser-test-screenshots` artifact

## Test Coverage

The browser tests cover:

1. **Login Flow** - User authentication to admin panel
2. **Resource Access** - Accessing the User resource
3. **Combobox Interaction** - Creating a user with the combobox field
4. **Search Functionality** - Testing the combobox search feature

## Debugging

### View Browser in Non-Headless Mode

To see the browser during test execution, set the `DUSK_HEADLESS_DISABLED` environment variable:

```bash
DUSK_HEADLESS_DISABLED=1 php vendor/bin/pest tests/Browser
```

### Check Console Logs

Console logs from failed tests are saved to `tests/Browser/console/`

### Manual Testing

You can manually test the admin panel by:

1. Starting the server: `php vendor/bin/testbench serve`
2. Creating a test user in tinker:
   ```bash
   php vendor/bin/testbench tinker
   ```
   ```php
   User::create([
       'name' => 'Test User',
       'email' => 'test@example.com',
       'password' => bcrypt('password'),
       'role' => 'admin'
   ]);
   ```
3. Visit `http://127.0.0.1:8000/admin` and login

## Troubleshooting

### ChromeDriver Issues

If you encounter ChromeDriver errors:

```bash
# Update ChromeDriver
php vendor/bin/dusk-updater detect --auto-update

# Or manually specify Chrome version
php vendor/bin/dusk-updater update --version=120
```

### Port Already in Use

If port 8000 is already in use, specify a different port:

```bash
php vendor/bin/testbench serve --port=8080
```

Then update the `APP_URL` in `.env.dusk.local`:

```
APP_URL=http://127.0.0.1:8080
```
