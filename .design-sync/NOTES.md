# design-sync notes (Balibu → Claude Design "Balibu Design System")

Project: https://claude.ai/design/p/df2a6f00-c49c-4355-9652-1ee2b40fa795

## How this repo builds for the sync

- The app is Next.js with no package build, so `design-system/` is a small repo-owned package (`@balibu/design-system`) made only for this sync. `node design-system/build.mjs` (cfg.buildCmd) writes `design-system/dist/`, which is gitignored:
  - `src/index.ts` re-exports the site components, plus `SiteFrame` (theme root; cfg.provider).
  - `next/image` → `src/shims/next-image.tsx` (plain `<img>`).
  - Every image path the components use is embedded as a ≤760px WebP data URL by `encode-images.py` (needs **python3 + Pillow**). Other root-relative paths fall back to `raw.githubusercontent.com/KendrickKam40/nextjs-boilerplate/<HEAD sha>/public`, so push before syncing if anything relies on the fallback.
  - `tsc -p design-system/tsconfig.json` emits the `.d.ts` tree. build.mjs rewrites `@/…` specifiers to relative paths.
  - esbuild comes from `.ds-sync/node_modules`, so stage the converter (`.ds-sync/`) before running buildCmd.
- Fonts: `next/font` CSS variables don't exist outside Next. `src/tokens.css` sets `--font-display/--font-body/--font-script` on `:root`, and `design-system/fonts.css` (cfg.extraFonts) ships the `@font-face` rules for `public/fonts/*`.
- `SiteFrame` wraps children in `<main style="display:contents">` because site.css styles headings only under `.balibu-site :where(main) h2`. Without it, section headings render in Manrope.
- `dtsPropsFor` covers every component with a `RestaurantData`/`OpenState`/`DisplayPlaylist` prop, because the extractor dropped those types and the `| null`s. Keep these in step with `lib/site-content.ts`, `lib/site-hours.ts` and `lib/display.ts`.
- Network: the Claude Code sandbox blocks curl to GitHub, so don't try to verify fallback image URLs from the shell. Headless Chromium can reach the internet.
- Playwright: `npm i playwright@1.63` in `.ds-sync/` matches the cached `chromium-1243`.

## Previews

- All 13 components have authored previews in `.design-sync/previews/`, all graded good (first sync, 2026-10-09).
- Full-width sections use `cardMode: column` at 1280px; RestaurantSite, StoreDisplay and CommerceDialog use `single`.
- StoreDisplay is `position: fixed`. Its preview gives it a 16:9 box with `transform: translateZ(0)` so it fills the card.
- Menu and drink prices in the MenuSection/SweetSection previews are illustrative, not from the POS.

## Known render warns

- `[FONT_MISSING] "Arial Black", "Impact"`: system fallbacks after the shipped brand fonts in the `--b-sign` stack. Benign.
- `[RENDER_THIN] CommerceDialog`: fixed-position sheet, so its measured height is 0. The screenshot renders fully. Its iframe body is the live ordering site, which shows "Client not found" to headless browsers. That is expected.

## Re-sync risks

- `dtsPropsFor` holds hand-written copies of the data shapes. If the POS types or component props change, these go stale silently.
- The embedded image set is derived by regex from `lib/site-imagery.ts` (`key: { src: '…' }` and `key: CONST,` lines) and from string paths in components. A new pattern there, or an image used only via another lib file, falls back to the GitHub URL instead of being embedded.
- The bundle is ~1.7 MB, mostly embedded images. Adding many images grows every design's load.
- `SiteFrame`, the next/image shim and `tokens.css` live only in `design-system/`. If the app's theming (site.css root class, font variables) changes, update these too.
