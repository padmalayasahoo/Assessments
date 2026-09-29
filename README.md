# Fintech QE Take-Home Assessment

## Tech choices

I went with **Playwright + TypeScript** since it handles both API testing (via its built-in `APIRequestContext`) and browser-based UI tests in the same runner. That let me avoid pulling in a separate HTTP library like supertest and keep the toolchain simple for a 2-hour window.

For the "API" to test against I built a small Express server with an in-memory store. I know a real candidate wouldn't normally ship the backend they're testing, but since no real service was provided the mock gives Playwright something live to hit rather than just testing against fixtures.

## Running it

```bash
npm install
npx playwright install chromium
npm test
```

That's it — global setup spins up the mock server automatically on port 4000 before the first test, teardown kills it after.

To run just the API or UI suites:

```bash
npm run test:api
npm run test:ui
```

**HTML report:**

```bash
npm run report:open
```

## Environment config

There are three environment configs under `config/environments/` (dev/qa/prod). The active one is picked via the `TEST_ENV` env var — defaults to `dev`.

```bash
TEST_ENV=qa npm test
# or for prod where you'd want a real key:
TEST_ENV=prod API_KEY=your-key npm test
```

The prod config points at a placeholder URL since there's no real prod service. The pattern is there though.

## What's tested

**API (tests/api/)**
- POST /api/users — create, validation errors (name/email/accountType), duplicate email (409), missing/bad API key (401/403)
- GET /api/users/:id — happy path, 404
- POST /api/transactions — transfer/deposit/withdrawal, validation, unknown userId/recipientId, missing recipientId on transfer
- GET /api/transactions/:userId — empty list, multiple results, checks transactions only come back for the right user

**UI (tests/ui/)**
- Registration flow: success message on create, duplicate email error, browser-native validation on empty required fields
- Transaction flow: successful transfer and deposit, error on unknown userId or recipientId, screenshot captured on failure

## Structure

```
config/            env loader + per-env JSON files
mock-server/       Express API + in-memory store
mock-frontend/     static HTML forms for the UI tests
tests/
  api/             API specs
  ui/              browser specs
  utils/           ApiClient wrapper, test data factories, custom assertions, response logger
playwright.config.ts
```

## Reporting

Playwright writes HTML, JSON, and JUnit XML reports on every run (see `playwright.config.ts`). Individual API responses are logged to `test-results/api-logs/` as JSON. Screenshots on UI failure go to `test-results/screenshots/`.

## What I'd add with more time

- Notification service coverage — skipped it since there's no Redis endpoint in the spec, but I'd mock the notification webhooks
- Parameterized data-driven tests for the validation edge cases (table-driven with `test.each`)
- Contract tests between the gateway and downstream services
- Performance baseline using Playwright's built-in tracing or k6 for the transaction endpoint under load
- CI config (GitHub Actions) — straightforward to add but didn't want to burn time on YAML
