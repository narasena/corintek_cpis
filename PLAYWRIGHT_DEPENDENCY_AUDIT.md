# Playwright Dependency Audit

## Summary

This project does **not** install Playwright as a dependency.

There are **no** `playwright`, `playwright-core`, or `@playwright/test` entries in:

- `package.json`
- the root `package-lock.json` dependency tree

## Why Playwright Appears in the Lockfile

The only Playwright-related references are **optional peer dependency declarations** inside other packages:

- `next` declares `@playwright/test` as an **optional peer dependency** (used by Next's experimental `next test` runner).
- `vitest` declares `@vitest/browser-playwright` as an **optional peer dependency** (used only if enabling Vitest "browser" mode with Playwright).

These are metadata declarations and **do not cause npm to install Playwright** for this repo.

## Packages To Remove

None.

There are no Playwright packages in the dependency tree to remove without introducing breakage or working around upstream metadata.

## Plan (If Playwright Ever Gets Added)

If Playwright shows up in a future install, it will be because someone added it directly or indirectly. In that case:

1. Identify the source with `npm ls @playwright/test playwright playwright-core`.
2. Remove the direct dependency (or the feature requiring it).
3. Regenerate lockfile via `npm install` / `npm ci`.
4. Re-run `npm run build` to confirm production builds still work.

## Verification Commands

The following checks should return empty:

```bash
npm ls @playwright/test playwright playwright-core --all --depth=10
```

If you suspect install-time downloads, do a clean install and ensure no Playwright packages appear:

```bash
rm -rf node_modules
npm ci
```

