# Balibu: how to build with this system

Balibu is an Indonesian food stall inside Esk Eats, Invercargill Central (New Zealand): nasi goreng, mie goreng, rendang, bakso, satay, then milkshakes, smoothies, slushies, dirty soda and soft serve. The look is a hand-painted food cart: tall condensed sign lettering, flat colour fields, food cutouts.

## Always

- **Wrap everything in `<SiteFrame>`.** It sets the `--b-*` tokens, the fonts and the heading style. Outside it, components fall back to unstyled serif text. One `SiteFrame` per page is enough; nest another only to recolour a region (`theme={{ primaryColor, secondaryColor, textColor, headingPrimaryColor, backgroundColor }}`).
- **Sections are full-bleed.** `Hero`, `GiantWord`, `MenuSection`, `SweetSection`, `StorySection`, `VisitScene` and `Ticker` each span the page width and set their own padding from `--b-gutter`. Stack them directly. Don't put them in cards or narrow columns. `Hero` sizes itself to the viewport.
- **Use `Ticker` at seams** between two colour fields. Use `tilt` once per page at most, under the hero.
- **Buttons are the global pill classes:** `<button className="b-pill b-pill--ink">`. Tones: `--ink` (green), `--gold`, `--cream`, `--line` (outline). Add a trailing `ArrowUpRight` icon (lucide) for links that leave the page.
- **Open/closed state** is `{ open: boolean, label: string }`. Labels read like `Open now · until 9 pm`, `Opens 10 am`, `Closed · opens 10 am tomorrow`. Pass `null` while unknown; the chip hides.
- **Menu data** (`MenuSection`, `SweetSection`) takes the POS feed shape in their `.d.ts`, or `null` for the editorial version without prices. Don't invent prices for real designs; use `null` unless the brief gives real ones.

## Palette and type (tokens)

`--b-paper` coconut cream `#fff3df` · `--b-ink` pandan green `#1d5a35` · `--b-accent` sambal red `#bd2f1b` · `--b-gold` palm sugar `#f6c445`. Text on red or green is cream (`--b-on-accent`, `--b-on-ink`). Display type is `var(--b-sign)` (Big Shoulders Display, weight 900, uppercase, line-height ~0.85). Body is Manrope. `var(--b-script)` (Yellowtail) is a small accent only, never for headings.

## Voice

Short, warm and a bit cheeky ("Then a milkshake, because you’ve earned it."). Call the place **Esk Eats, Invercargill**. "T.29" appears only inside the full street address, never in headings or copy.

## Things that look broken but aren't

- `CommerceDialog` frames the live ordering/booking site; its body is that third-party page. `mode={null}` keeps it closed.
- `StoreDisplay` fills the whole screen (`position: fixed`), like the counter TV. To show it inside a layout, give it a box with `transform: translateZ(0)` and a 16:9 aspect ratio.
- `RestaurantSite` fetches `/api/client` and shows the editorial menu and published hours when that isn't reachable. It is the whole page, so don't nest it in other sections.
