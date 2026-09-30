# QA Automation – Store Admin adds a product (Playwright + TypeScript)

1. Log in as a Store Admin
2. Go to the **Inventory** module
3. Fill in **Product Name** and **Price**
4. Click **Save**
5. Check that a success toast message appears

## Project structure

```
.
├── playwright.config.ts          # baseURL, retries, traces, browsers
├── tsconfig.json
├── .env.example                  # copy to .env (the real .env is git-ignored)
├── src/
│   ├── config/env.ts             # reads and checks the required env variables
│   ├── fixtures/test.ts          # custom `test` that provides the page objects
│   └── pages/                    # Page Object Model
│       ├── LoginPage.ts
│       └── InventoryPage.ts
└── tests/
    └── inventory/add-product.spec.ts
```

## Prerequisites

- Node.js 18 or newer
- A running environment of the POS web app (staging/QA)
- A **Store Admin** test account in that environment

## 1. Install

```bash
npm install
npx playwright install
```

## 2. Add your environment and credentials

The tests read the app URL and login details from environment variables, never from the code.

**Option A: local `.env` file (for running on your machine)**

Create `.env` from the template in the project root:

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Then fill it in:

```dotenv
BASE_URL=https://staging.your-pos-app.com
ADMIN_EMAIL=store.admin@yourcompany.com
ADMIN_PASSWORD=your-password
```

| Variable         | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `BASE_URL`       | Root URL of the app. The test opens `BASE_URL/login`.              |
| `ADMIN_EMAIL`    | Email of a user with the Store Admin role.                         |
| `ADMIN_PASSWORD` | Password for that user.                                            |

`.env` is listed in `.gitignore`, so your credentials will not be committed. If a variable is missing, the run stops with `Missing required environment variable: <NAME>`.

**Option B: shell variables (one-off runs)**

```bash
# macOS / Linux / Git Bash
BASE_URL=https://staging.your-pos-app.com ADMIN_EMAIL=... ADMIN_PASSWORD=... npm test
```

```powershell
# Windows PowerShell
$env:BASE_URL="https://staging.your-pos-app.com"; $env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."; npm test
```

**Option C: CI (e.g. GitHub Actions)**

Add `BASE_URL`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` under **Settings → Secrets and variables → Actions**, then pass them to the job:

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

## 3. Match the test to the real app

The test was written without access to the application, so check these against the real UI before the first run:

| What                     | Where                                                           | Current value                                          |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------ |
| Login page path          | [src/pages/LoginPage.ts](src/pages/LoginPage.ts) → `goto()`     | `/login`                                               |
| Login field labels       | [src/pages/LoginPage.ts](src/pages/LoginPage.ts)                | `Email`, `Password`, button `Log in`                   |
| Inventory link and URL   | [src/pages/InventoryPage.ts](src/pages/InventoryPage.ts) → `open()` | link `Inventory`, URL contains `/inventory`        |
| Product form labels      | [src/pages/InventoryPage.ts](src/pages/InventoryPage.ts)        | `Product Name`, `Price`, button `Save`                 |
| Save API endpoint        | [src/pages/InventoryPage.ts](src/pages/InventoryPage.ts) → `save()` | `POST /api/v1/inventory/items`                     |
| Success toast text       | [tests/inventory/add-product.spec.ts](tests/inventory/add-product.spec.ts) | `Product saved successfully`                |
| Test data (name, price)  | [tests/inventory/add-product.spec.ts](tests/inventory/add-product.spec.ts) | `Wireless Mouse <timestamp>`, `25.00`       |

Locators use accessible roles and labels (`getByRole`, `getByLabel`). If a field has no label in the real app, switch to `page.getByTestId('...')` in the page object. Only the page objects need to change; the test itself stays the same.

Tip: `npx playwright codegen https://staging.your-pos-app.com` opens the app and suggests locators as you click around.

## 4. Run

```bash
npm test                               # headless, Chromium + Firefox
npm run test:headed                    # watch the browser
npm run test:ui                        # Playwright UI mode (step through, time travel)
npx playwright test --project=chromium # one browser only
npx playwright test --debug            # Playwright Inspector, pause on each step
```

## 5. Review results

```bash
npm run report
```

The HTML report is written to `playwright-report/`. On failure it includes a screenshot and a video. In CI, failed tests are retried and the retry records a trace; to record one locally, run `npx playwright test --trace on`. Open a trace with `npx playwright show-trace <path-to-trace.zip>`.
