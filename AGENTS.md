# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page Vue 3 + TypeScript web app (built with Vite) that helps users build format strings for [Python's `logging` module](https://docs.python.org/3/library/logging.html). Users assemble a format from log-record tokens (e.g. `%(asctime)s`) and custom text, see a live preview against sample log data, and copy the result. Deployed as static content to GitHub Pages on every push to `main` (see `.github/workflows/pages.yml`).

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`vue-tsc`) and build to `dist/` (this is what CI runs)
- `npm run type-check` — `vue-tsc --noEmit` only
- `npm run lint` — ESLint with `--fix` over all source files
- `npm run format` — Prettier over `src/`
- `npm run preview` — serve the built `dist/`

There is no test suite. The `@` import alias maps to `src/` (configured in both `vite.config.ts` and the tsconfig files).

## Architecture

The entire UI lives in `src/App.vue`. State is a single reactive array `selectedItems: FormattedItem[]` representing the user's chosen format, in order. Everything else derives from it.

**Core data model** (`src/interfaces/internal.ts`): a `FormattedItem` is one element of the format — either a log-record token or a piece of user text. Its `type` (`'string' | 'float' | 'integer' | 'usertext'`) determines how it renders into the Python format string.

**The format string is generated two different ways, and they must stay consistent:**

- Serialization (item → string) happens in `App.vue`'s `resultText` computed: `string`→`%(value)s`, `float`→`%(value)f`, `integer`→`%(value)d`, `usertext`→the raw value.
- Parsing (string → items) happens in `src/parsing.ts` via a hand-written `Scanner`/recursive-descent parser, used to load presets. It alternates between reading literal text and reading `%(name)[padding][type]` templates, looking up each token in `templateItems`. Note: parsing recognizes padding (e.g. `%(levelname)-8s`) but serialization currently drops it.

**Token definitions** (`src/items.ts`): `templateItems` is the canonical map of supported Python log-record attributes (name → description + type), driving the token buttons. `textItems` are the quick-insert literal snippets. To add a new supported token, add it here.

**Presets** (`src/presets.ts`): named example format strings, parsed through `parsing.ts` when selected.

**Sample logs** (`src/assets/logs.json`): rows of fake `LogRecord` field values used to render the live "Example Logs" preview. Keys must match `templateItems` token names.

**`ItemDialog.vue`**: a promise-based modal. `show()` returns a `Promise<EditResult>` that resolves on submit/cancel/delete; `App.vue` awaits it to add custom text or edit/delete an existing item.

**Theme** (`src/stores/config.ts`): a Pinia store persisted to localStorage (`pinia-plugin-persistedstate`) that toggles `data-theme` on `<html>`. Styling uses Pico CSS plus SCSS in `src/assets/main.scss` and per-component `<style lang="scss">`.

## The `analysis/` directory

Offline tooling, not part of the app build. `analysis/fiddle.ipynb` and `analysis/dummy-data/` (a small Python program with a `log.conf`) are used to introspect real Python `LogRecord` attributes and generate the sample data in `src/assets/logs.json` / `analysis/attributes.raw.json`. Regenerate these when updating the supported token list.
