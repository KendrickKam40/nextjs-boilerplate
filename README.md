# Balibu

A Next.js 15 / React 19 restaurant website. The public site uses the original Balibu logo, locally hosted fonts and a consistent set of generated editorial food photographs. Framer Motion connects the homepage navigation cards to full-screen restaurant chapters. Online ordering and bookings remain with Balibu’s existing providers.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Brand content, food collections and Balibu’s published location details render without backend credentials. Live prices and bookings come from the configured restaurant service. Google Maps links open the verified location; no Google API key or live review feed is needed. The editorial collections never invent prices or availability.

```sh
npm run typecheck
npm test
npm run build
```

To check production while the dev server is running, use `NEXT_BUILD_DIR=.next-verify npm run build`. Run the matching build with `NEXT_BUILD_DIR=.next-verify npm start` (choose an unused port). The separate output prevents development and production manifests from overwriting each other.

## Structure

- `app/page.tsx`: small public page entry point.
- `components/site/`: the long-scroll homepage (sticky bar, hero slideshow, tilted open-now ticker, giant-word section, menu card rail, Our story, Something sweet, Visit, footer), shared primitives in `site.css`, the data hook and the accessible ordering/booking dialog.
- `lib/site-content.ts`: typed restaurant data and editorial collection content.
- `lib/site-imagery.ts`: shared local image collection; generation prompts and provenance are in `docs/assets/`.
- `lib/site-location.ts`: published Balibu contact details and verified location links; sources are in [docs/location-sources.md](docs/location-sources.md).
- `lib/layout-config.ts`: shared section definitions for the public page and admin editor.
- `app/api/_lib/maxorder.ts`: shared POS request configuration, validation and timeout.
- `app/admin/`: staff settings for in-store videos, website colours and homepage layout. Each tab lives in `app/admin/(protected)/_components/`; unsaved changes are kept if a session expires.
- `app/store-display/` and `components/display/`: the unattended counter screen. It polls `/api/display` every minute, skips videos that can't play, reloads a stalled player, retries when offline and reloads nightly at 4 am. `lib/youtube.ts` is the shared link parser, so admin only accepts links the screen can play.
- `middleware.ts`: admin session checks and optional coming-soon gate.
- `migrations/`: database schema for theme, layout and the store-display playlist (`0003_create_playlist_items`).
- `tests/backend.test.cjs`: configuration failure, authentication and API regression tests.

The public page follows the admin's stored section order, visibility and `layoutPreview`. Only theme colours set in `/admin` apply, scoped to the restaurant surface through `--b-*` variables (`lib/site-theme.ts` rejects low-contrast choices); POS colours are not applied. Older widgets remain in `components/` for existing integrations; the homepage uses `components/site/`.

The homepage takes its cues from bold food-and-drink brand sites: drenched fields of sambal red, pandan green and palm-sugar yellow, tall condensed Big Shoulders Display capitals, and big food cutouts. The hero is a slow slideshow: nasi goreng, rendang and a milkshake each hold for 7 seconds between two tall words, with the field colour cross-fading between dishes and the next dish peeking in, out of focus. It pauses on hover, focus, a hidden tab or the pause button, and doesn't autoplay with reduced motion. A tilted ticker shows live open status, “NASI GORENG” runs edge to edge with the plate passing through it on scroll, and the menu is a sideways rail of colour cards.

Sections scroll in the admin's order and keep their deep links (`#menu`, `#about`, `#flavours` for Something sweet, `#contact`). The menu cards show live item names, prices and sold-out status when the restaurant service is configured, and named-dish editorial copy otherwise. Our story sits beside the attributed photo of the real Esk Eats counter. Something sweet gives the milkshake and sundae their own field, with live sweet prices. Visit shows location, hours, open-now status and booking when enabled.

Order online sits in the sticky bar on larger screens and in a fixed bottom bar on phones. On screens 700px wide or narrower, ordering and booking open the provider in the same tab; larger screens use the dialog. Safe areas are respected and pinch zoom stays enabled.

`lib/site-navigation.ts` defines the section ids and labels. Dish plates live at `public/images/brand/plate-*.png` (provenance in `docs/assets/higgsfield-plates.md`). No WebGL runtime or CDN dependency is needed.

Local visual checkpoints are saved in `.design-checkpoints/` (ignored by Git), from the original scroll prototype through the click-based dish experience. The original generated assets remain in `public/images/brand/`.

## Configuration

Set values in `.env.local` or your deployment environment; do not commit secrets.

| Variables                                                     | Purpose                                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `MAXORDER_UPSTREAM`, `MAXORDER_API_KEY`, `MAXORDER_CLIENT_ID` | Live restaurant details, categories and menu                                        |
| `POSTGRES_URL` or `DATABASE_URL`                              | Admin layout, theme and store-display data; apply the SQL files in `migrations/`    |
| `ADMIN_SECRET`, `ADMIN_PASSWORD`                              | Admin session signing and login                                                     |
| `FIREBASE_SERVICE_ACCOUNT` (JSON service account)             | Existing optional loyalty API authentication                                        |
| `COMING_SOON=true`                                            | Enable the public coming-soon page; `?preview=1` grants the existing preview cookie |
| `DISPLAY_PATH`                                                | Optional extra path for the store display (e.g. `counter-tv`); `/store-display` still works |
| `NEXT_PUBLIC_SITE_URL`                                        | Canonical site origin for social metadata (defaults to `https://balibu.co.nz`)      |
| `NEXT_BUILD_DIR`                                              | Optional isolated Next.js output directory                                          |

Verify the deployment’s Firebase runtime/dependencies before enabling loyalty. Existing loyalty balances are placeholders, and the redesign does not expose that feature. Ordering and booking destinations are defined in `CommerceDialog.tsx`; their external checkout systems are not implemented in this repository.

## Interaction and accessibility

The page supports keyboard navigation with a skip link, visible focus rings, reduced motion and an accessible native modal dialog. Browser Back closes the ordering dialog; focus returns to the triggering order control. A persistent external link offers an alternative to the embedded provider.

Fonts are bundled in `public/fonts/` with their licences: Big Shoulders Display and Manrope (SIL Open Font License) and Yellowtail (Apache 2.0). No Google Fonts requests are needed at runtime or build time.

If running Next.js 15 on Node 25, start development with `NODE_OPTIONS=--no-experimental-webstorage npm run dev` to avoid the native Web Storage compatibility issue in the development overlay.

The About wording draws gently on a small, documented review sample, alongside the published menu. Research and limitations are in `docs/review-research.md`; counter-photo provenance is in `docs/assets/store-collage.md`; published location sources are in `docs/location-sources.md`. Reviews are not fetched at runtime.

The milkshake and Fully Loaded Sundae cutouts are generated solely from Balibu’s published online-ordering product photographs and are used in the hero, the menu cards and Something sweet. Original references, exact prompts and provenance are documented in `docs/assets/ordering-cutouts.md`.
