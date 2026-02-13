# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build (outputs to /build)
pnpm preview      # Preview production build
pnpm check        # Type-check with svelte-check
pnpm check:watch  # Type-check in watch mode
pnpm lint         # Run ESLint
```

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (uses runes: `$props()`, `$state()`, etc.)
- **Styling**: Tailwind CSS v4 with forms and typography plugins
- **Build**: Vite 7, static adapter (SPA mode with `ssr: false`, `prerender: true`)
- **Package Manager**: pnpm
- **Deployment**: Docker with nginx for static file serving

## Project Structure

- `src/routes/` - SvelteKit file-based routing
- `src/lib/` - Shared code, importable via `$lib` alias
- `src/lib/assets/` - Static assets processed by bundler (e.g., favicon)
- `static/` - Public static files served as-is
- `src/service-worker.js` - PWA service worker for asset caching

## Key Configuration

- This is a **client-side SPA** (`src/routes/+layout.ts` sets `ssr = false`)
- Static build outputs to `/build` directory
- Tailwind v4 uses CSS-based config (`@plugin` directives in `layout.css`)

## Dependencies

- `lucide-svelte` - Icon library
- `runed` - Svelte utilities
- `svelte-french-toast` - Toast notifications
