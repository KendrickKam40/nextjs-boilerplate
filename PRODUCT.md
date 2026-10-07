# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary today: Invercargill locals and Invercargill Central foot traffic.** People near or inside the Esk Eats food court deciding what to eat, mostly on phones, then walking up to the counter or ordering through Balibu's existing providers.
- **Growing audience: online orderers.** Returning customers who already know Balibu and want the fastest path to ordering or booking. Online is not a big push yet, but the site should be ready for it.
- **Growing audience: newcomers.** People who have never heard of Balibu and need to quickly understand what Indonesian food it serves and why it is worth a visit.
- **Staff: owner and counter staff, non-technical.** They use `/admin` occasionally to change the homepage chapter order and visibility, theme colours and the in-store video playlist. `/store-display` runs unattended on an in-store screen.

## Product Purpose

Balibu is an Indonesian / Balinese food counter at Esk Eats, Invercargill Central. The website shows what Balibu serves, where to find it and when it is open, and hands visitors off to ordering and booking. Success: a visitor knows what they want to eat and where to get it, and either walks up or orders.

## Positioning

Indonesian comfort food in a Southland food court, with a warm welcome and drinks and desserts (shakes, smoothies, slushies, soft serve, sundaes) treated as seriously as the savoury food. The working line is "Indonesian comfort food. A warm welcome. Something sweet to finish." The homepage headline is "Big flavour. Bali soul."

## Operating Context

- Physical counter: T.29 Esk Eats, Invercargill Central, 39 Esk Street, Invercargill 9810. Open Monday–Sunday, 10:00 am–9:00 pm. Phone 022 065 4478. Source: `lib/site-location.ts`, `docs/location-sources.md`.
- Live menu, prices, availability, opening status and booking access come from the MaxOrder restaurant service (`app/api/_lib/maxorder.ts`). Ordering and booking checkout belong to external providers (`components/site/CommerceDialog.tsx`); they are not built in this repo.
- Owner-controlled settings (chapter order and visibility, theme colours, store-display playlist) live in Postgres and are edited in `/admin`.
- `/coming-soon` is an optional public gate (`COMING_SOON=true`).
- `/store-display` is an unattended in-store screen playing a muted YouTube playlist.

## Capabilities and Constraints

- Next.js 15 / React 19, CSS Modules for the public site (`components/site/`), Tailwind 4 available, Framer Motion for scroll-linked motion. Fonts are bundled locally with no runtime font CDN.
- The homepage is one long scroll: hero slideshow and a “NASI GORENG” feature, then The menu, Our story, Something sweet and Visit sections in the order and visibility set in `/admin`, with deep links (`#menu`, `#about`, `#flavours`, `#contact`). Order online stays reachable in a sticky bar (and a bottom bar on phones).
- The public site must render without backend credentials. Editorial collections never invent prices or availability; live prices come only from the restaurant service.
- Admin theme colours are scoped to the restaurant surface and must stay usable for whatever the owner picks.
- Loyalty/points exists in the API but is not exposed. Its balances are placeholders and must not be surfaced as real.
- Undecided: how hard to push online ordering versus walk-ups as the online audience grows.

## Brand Commitments

- Name: **Balibu**. Use the original Balibu logo (`components/site/BrandLogo.tsx`) unaltered.
- Voice: warm, welcoming and **playful**, with food-court energy and punchy copy in NZ English. Playful never overrides honesty.
- Drinks and desserts get equal billing with the savoury food.

## Evidence on Hand

- Published location, hours and phone: `lib/site-location.ts` (checked 2 October 2026).
- Attributed photo of the real Esk Eats counter: `public/images/store/balibu-counter.jpg`, with provenance in `docs/assets/store-collage.md`.
- Generated editorial food imagery: `public/images/brand/`, with prompts and provenance in `docs/assets/`. Transparent milkshake and sundae cutouts come from Balibu's published ordering photos (`docs/assets/ordering-cutouts.md`).
- Review research: three Google-origin comments praising service, a milkshake, vanilla ice cream and a slushie (`docs/review-research.md`). This is not a representative sample.
- **Absent, do not fabricate:** testimonials, review quotes, ratings, awards, rankings, "customer favourite" claims about any savoury dish, prices or availability outside the live feed, and loyalty balances.

## Product Principles

1. **Hungry to decided, fast.** Every surface helps someone pick food and know where and when to get it. A phone in a food court is the default scene.
2. **Honest appetite.** Make the food irresistible using only real menu facts and live data. Never use invented social proof.
3. **Sweet is a first-class course.** Drinks and desserts are a reason to come, not an afterthought.
4. **Ready to grow online.** Keep the ordering and booking handoff obvious and persistent, so the site can lean harder into online when the business does.
5. **Staff screens just work.** Admin and store-display serve non-technical staff and an unattended screen. Clarity and resilience come before expression.

## Accessibility & Inclusion

Existing commitments to keep: full keyboard navigation, focus management into and out of chapters and dialogs, `prefers-reduced-motion` gives a static scene, a visible pause control for ambient motion, safe-area handling, and pinch zoom left enabled.
