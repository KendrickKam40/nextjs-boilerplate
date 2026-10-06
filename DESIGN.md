---
name: Balibu
description: Indonesian comfort food at Esk Eats, painted like a gerobak food cart in loud colour fields and fat sign lettering.
colors:
  sambal-red: "#bd2f1b"
  sambal-deep: "#a62918"
  pandan-leaf: "#1d5a35"
  pandan-muted: "#4a7957"
  palm-sugar: "#f6c445"
  coconut-cream: "#fff3df"
  cream-on-pandan-muted: "#cdd1ba"
  pandan-line: "rgba(29, 90, 53, 0.18)"
  pandan-line-soft: "rgba(29, 90, 53, 0.10)"
  open-green: "#3fbf5a"
typography:
  display:
    fontFamily: "Bungee, 'Arial Black', sans-serif"
    fontSize: "clamp(56px, min(12.8vw, 25svh), 250px)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bungee, 'Arial Black', sans-serif"
    fontSize: "clamp(48px, 8.4vw, 150px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bungee, 'Arial Black', sans-serif"
    fontSize: "clamp(26px, 2.6vw, 40px)"
    fontWeight: 400
    lineHeight: 0.95
  script:
    fontFamily: "Yellowtail, 'Brush Script MT', cursive"
    fontSize: "clamp(26px, 2.6vw, 38px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
  lead:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(16px, 1.4vw, 19px)"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Bungee, 'Arial Black', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  small:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  sticker: "18px"
  panel: "28px"
  photo: "32px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4.4vw, 72px)"
  section-y: "clamp(64px, 9vw, 140px)"
  section-gap: "clamp(28px, 4vw, 56px)"
  bar: "72px"
  bar-mobile: "64px"
components:
  button-pill-cream:
    backgroundColor: "{colors.coconut-cream}"
    textColor: "{colors.sambal-red}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-pill-gold:
    backgroundColor: "{colors.palm-sugar}"
    textColor: "{colors.pandan-leaf}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-pill-ink:
    backgroundColor: "{colors.pandan-leaf}"
    textColor: "{colors.coconut-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  sign-bar:
    backgroundColor: "{colors.sambal-red}"
    textColor: "{colors.coconut-cream}"
    padding: "0 clamp(20px, 4.4vw, 72px)"
    height: "{spacing.bar}"
  ticker-band:
    backgroundColor: "{colors.palm-sugar}"
    textColor: "{colors.pandan-leaf}"
    padding: "16px clamp(9px, 1.2vw, 17px)"
  cart-panel:
    backgroundColor: "{colors.coconut-cream}"
    textColor: "{colors.pandan-leaf}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 2.6vw, 36px)"
  open-chip:
    textColor: "{colors.coconut-cream}"
    typography: "{typography.small}"
  counter-sticker:
    backgroundColor: "{colors.palm-sugar}"
    textColor: "{colors.pandan-leaf}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
---

# Design System: Balibu

## Overview

**Creative North Star: "The Gerobak"**

Balibu is painted like an Indonesian food cart and warung signboard: whole sections drenched in one flat colour, fat block-capital lettering that fills the width, a sign-writer's script flourish cutting across it, and real food cut out and set straight onto the paint at huge scale. The page reads as a sequence of painted cart panels (sambal red, pandan green, palm-sugar yellow, sambal red again, pandan green for the footer), stitched together by a scrolling ticker band, under a sticky red sign bar that always carries Order online.

Density is loud and low: few words per field, enormous display type, one lead line of bold Manrope, then a pill. Depth is paint, not material: a hard offset shadow under display lettering, a pinstripe inside the cart panels, and soft contact shadows only under the food cutouts. The world explicitly replaces the previous cream-paper editorial page with italic serif, hairline rules and photo cards.

Colours are owner-editable in /admin, so every surface reads from the five base tokens and derives the rest. An owner pick that would make text hard to read is ignored and the Balibu colour stays.

**Key Characteristics:**
- Drenched single-colour section fields, never tinted cards on a neutral page.
- Bungee block capitals for every headline, with a painted hard shadow.
- Yellowtail script for asides that cut across or hang off the capitals.
- Food as transparent cutouts on the field, never framed photo cards.
- Pill buttons like painted enamel plates; a tilt on hover.
- A rolling ticker band of real dishes between fields.

## Colors

Four sign-painter's enamels at full saturation, with coconut cream as the lettering colour and pandan green doing the work of ink.

### Primary
- **Sambal Red** (sambal-red): the hero field, the Story and Visit fields, the sticky sign bar and the browser theme colour. Carries cream lettering (5.3:1). It is also the accent text on cream and on palm sugar, at display sizes only on palm sugar (3.6:1).
- **Sambal Deep** (sambal-deep): the darker sambal for small accent text on cream (6.5:1), used in the commerce dialog and links. Derived as 88% sambal mixed with black.

### Secondary
- **Pandan Leaf** (pandan-leaf): the ink of the system. The Menu field and footer field, all body text on cream and gold, pill borders, panel borders and pinstripes, ticker band rules, the outline stroke on script and the painted shadow on red fields. Owner-editable as "Text and dark panels"; the resolver falls back to a near-black (#191a17) if a custom page background leaves it under 7:1.

### Tertiary
- **Palm Sugar** (palm-sugar): the Featured field, the ticker band, the default painted shadow under cream lettering on red, script asides on red and green, nav hover underline, link underlines, the counter sticker and the focus ring.

### Neutral
- **Coconut Cream** (coconut-cream): the lettering colour on red and green fields, the cart-panel and ticket surface, the logo roundel, and the page background.
- **Pandan Muted** (pandan-muted): secondary text on cream panels (dish descriptions, item sub-lines), 4.6:1. Derived as 80% pandan into cream.
- **Cream on Pandan Muted** (cream-on-pandan-muted): secondary text on green fields (menu intro, footer small print, visit note copy), 5.2:1. Derived as 78% cream into pandan.
- **Pandan Line / Line Soft** (pandan-line, pandan-line-soft): dashed rules inside the menu ticket and specials list (2px dashed). Derived as pandan at 18% and 10% alpha.
- **Open Green** (open-green): only the lit dot of the open chip when the counter is open, with a 3px 30% halo.

### Named Rules
**The Drenched Field Rule.** Every section is one flat field of a single enamel, edge to edge: red hero, green Menu, red Story, gold Featured, red Visit, green footer. Fields meet at a hard seam or a ticker band, never a gradient or a tinted card.

**The No Red-on-Green Rule.** Sambal and pandan are never set as text and ground for each other (1.4:1). Green may sit on red only as a painted shadow, a script outline stroke, or a solid panel carrying cream text.

**The Gold Is Large Rule.** Palm sugar on sambal, and sambal on palm sugar, only at display or script sizes (26px and up); at 3.6:1 they are not text colours for reading copy.

**The Derived Tokens Rule.** Only the five owner-editable bases are literal. Muted text, rules and on-colours are color-mix derivations of them, so an owner theme keeps its contrast. On-accent text is chosen by the resolver from cream, white or near-black, whichever reads best on the owner's red.

## Typography

**Display Font:** Bungee (with 'Arial Black', sans-serif), self-hosted.
**Script Font:** Yellowtail (with 'Brush Script MT', cursive), self-hosted.
**Body Font:** Manrope 400 and 700 (with Arial, sans-serif), self-hosted.

**Character:** Bungee is the signboard: chunky, upright, all capitals, set tight and huge. Yellowtail is the sign-writer's flourish laid across it, always lowercase and rotated a few degrees. Manrope stays out of the way and does almost all its work at 700.

### Hierarchy
- **Display** (Bungee 400, min(16.6cqw, 36cqh) of the hero, 0.86): the hero word "FLAVOUR." only, spanning the field width, with "BIG" at 0.34em on its left shoulder. Painted shadow in palm sugar.
- **Headline** (Bungee 400, 0.92, -0.01em): section heads, sized per field from clamp(48px, 7vw, 120px) on Featured to clamp(64px, 13vw, 220px) on Menu, and clamp(54px, 12vw, 200px) for the footer sign. Text-wrap balanced. Always painted.
- **Title** (Bungee 400, clamp(26px, 2.6vw, 40px), 0.95, uppercase): ticket, note and visit-card headings; menu collection names (clamp(26px, 3.4vw, 54px)) and Featured tab names (clamp(40px, 5.6vw, 96px)) are the same role at list scale.
- **Script** (Yellowtail 400): asides inside headings at 0.36em to 1.05em of the capitals, rotated -5deg to -8deg, in palm sugar on red and green, sambal on gold. Standalone notes at clamp(26px, 2.6vw, 38px), 1.1.
- **Lead** (Manrope 700, clamp(16px, 1.4vw, 19px), 1.45, 30 to 34ch): the one line of copy under a heading; the hero line runs clamp(17px, 1.5vw, 21px), story copy 18px at 1.6 within 46ch.
- **Body** (Manrope 400, 16px, 1.5 to 1.6, 44 to 48ch): dish descriptions, visit note, item rows.
- **Label** (Bungee 400, 15px, 0.02em, line-height 1): pill text; nav links at 14px, 0.03em; prices at 17px with tabular numerals.
- **Small** (Manrope 700, 13px): open chip, counts, hours note, captions, footer small print. The public site's floor is 12px, used only for the phone link's sub-line; 13px is the working minimum.

### Named Rules
**The Painted Lettering Rule.** The hard sign-writer's shadow (0.045em 0.05em, no blur) goes on display lettering only: hero, section heads, footer sign, and the active item in a Bungee list. Its colour is the field's complementary enamel: gold under cream on red, sambal under cream on green, cream under green on gold, pandan under cream on red story fields. Never on body, labels or pills.

**The Outlined Script Rule.** When script is laid over other lettering (hero "Bali soul.", story aside) it takes a pandan stroke of 0.09em painted under the fill plus a 0.04em hard pandan shadow. Script that sits clear of the capitals stays unstroked.

## Layout

One long scroll of full-bleed fields. Horizontal padding is a single fluid gutter (clamp(20px, 4.4vw, 72px)); vertical field padding is clamp(64px, 9vw, 140px), with clamp(28px, 4vw, 56px) between blocks inside a field. There is no centred max-width container: lettering is sized to the viewport and runs edge to gutter.

Section compositions alternate so adjacent fields never repeat: Menu is text-left with a sticky dish stage right (0.9fr / 1.1fr); Featured flips it, food-led (1.15fr / 0.85fr); Story is a centred three-column stage with a milkshake and sundae either side that hang about 18% past the seam into the next field; Visit is two equal columns of details and the counter photo.

Breakpoints: at 900px multi-column fields collapse to one column and the nav hides. At 700px the bar shrinks to 64px, the hero stacks from 900px down (lettering, then the plate at up to 78% width overlapping the word's lower half, then copy), Bungee lists turn into horizontally scrolling pill rows, and a fixed full-width gold Order pill sits at the bottom over a pandan fade, with safe-area insets. A short-landscape rule (max-height 560px) shrinks the hero lettering by svh.

The sticky sign bar (72px, `--b-bar`) sets the scroll-margin for every deep-linked section.

## Elevation & Depth

Flat paint. Fields have no shadows and panels do not float. Depth comes from three painted devices: the hard offset text-shadow under display lettering, the pinstripe inset inside cart panels, and soft contact shadows under food cutouts so they sit on the field. Soft box shadows appear only where something genuinely overlays content.

### Shadow Vocabulary
- **Painted lettering** (`text-shadow: 0.045em 0.05em 0 <field complement>`): display lettering only; see the Painted Lettering Rule.
- **Food contact** (`filter: drop-shadow(0 26px 22px #0006)` to `drop-shadow(0 30px 30px #0005)`): every transparent food cutout (hero plate, menu dish, featured dish, shake and sundae).
- **Sticker lift** (`box-shadow: 0 0 0 3px <pandan>, 0 10px 24px #0003`): the specials sticker overlapping the Featured dish.
- **Overlay** (`box-shadow: 0 10px 24px #0004`): the fixed mobile order pill over scrolling content.
- **Focus** (`outline: 3px solid <palm sugar>; outline-offset: 3px; box-shadow: 0 0 0 6px <pandan>`): every focusable element on the site.

### Named Rules
**The Cutout Not Card Rule.** Food is a transparent cutout placed directly on the field with a contact shadow, allowed to overlap lettering, tickets and seams. It never sits in a framed photo card. The one rectangular photograph is the real counter, treated as a stuck-on print.

## Shapes

Two shapes carry the world: the fully round pill (999px) for every button, chip row and sticker label, and the generously rounded cart panel (28px) with a 3px pandan border and a 2px pandan pinstripe inset 11px inside it. The logo sits in a cream circle. The counter photo is a 32px-rounded print with a 3px cream keyline, tilted 1.5deg (flat and 24px on phones). Rules inside panels are 2px dashed; Bungee lists are divided by 3px solid rules. Small tilts (-1.5deg pill hover, -5deg to -9deg script and cutouts, -8deg logo hover) keep the hand-painted feel.

## Components

### Buttons
Painted enamel plates: chunky, round, slightly tipped when you reach for them.
- **Shape:** full pill (999px), 2px border in the fill colour, min-height 52px (46px in the bar, 56px on the mobile order bar), 0 26px padding, 12px gap to an arrow icon.
- **Cream:** coconut cream with sambal Bungee text; the primary action on red fields and in the sign bar.
- **Gold:** palm sugar with pandan text; actions on red and green fields and the mobile order bar.
- **Ink:** pandan with cream text; actions on gold fields and inside cream tickets.
- **Hover / Focus:** on hover-capable devices, translateY(-2px) rotate(-1.5deg) over 180ms cubic-bezier(0.22, 1, 0.36, 1), arrow nudges 2px up-right; active scales to 0.98; gold-and-pandan focus ring.
- **Outline pills (Visit contact):** Directions and phone are Manrope 700 pills with a 2px cream border; Directions filled cream with sambal text, turning gold on hover.

### Chips
- **Open chip:** Manrope 700 13px with a 9px dot. Closed: dot in currentColor at 55% opacity. Open: dot in open green with a 3px halo. Inherits the colour of the field it sits on; used in the hero, Visit and footer.

### Cards / Containers
- **Cart panel:** cream surface, pandan text, 28px corners, 3px pandan border with a 2px pinstripe 11px inside. Used for the menu ticket (the dish cutout overlaps its top by about 22%) and the Featured dish note.
- **Visit note:** a solid pandan block (28px corners, no border) on the red field with cream title and muted cream copy, its link row above a 2px dashed rule.
- **Specials sticker:** cream, 18px corners, ringed in pandan, pinned over the Featured dish, with a toggle and dashed price rows.

### Navigation
- **Sign bar:** sticky, 72px, sambal field with cream text and a 2px 22% cream bottom rule. Logo in a 56px cream roundel (tilts -8deg on hover), Bungee 14px links with a 3px gold underline that wipes in from the left on hover, and a cream Order pill at the end. Below 900px links hide; below 700px the bar order pill moves to the fixed bottom bar.
- **Bungee lists as navigation:** menu collections and Featured tabs are big Bungee rows between 3px rules. Hover slides the name 10px; the active row slides 14px, changes colour (gold on green, sambal on gold) and gains a painted shadow. On phones they become a scrolling row of 3px-bordered pills, the active one filled.

### Ticker Band
A painted banner of what is cooking: palm sugar with pandan Bungee capitals at clamp(20px, 2.6vw, 36px), 3px pandan rules top and bottom, sambal four-point stars between words. It rolls left on a 38s linear loop, pauses on hover, and stops entirely under reduced motion. It sits at the hero fold and above the footer. Its words are only dishes and drinks confirmed on the published menu, plus the counter number.

### Counter Sticker
The real counter photograph in Visit carries a gold pill label in Bungee 14px at its lower left, like a sticker on a print, with a provenance caption below.

### Hero Plate (signature composition and motion)
Type over the dish: one word, "FLAVOUR.", runs across the red field and is painted straight over the nasi goreng plate at its centre, every letter readable. The letters carry a 0.035em pandan sign-writer's outline so cream stays legible over the food. Back to front: a pandan disc with a gold pinstripe (1.14x the plate), the plate (min(36cqw, 64cqh)), the letters, then "Bali soul." painted across the plate's foot. The offer sits bottom-left, open status and T.29 bottom-right. The hero's height is capped at 62vw and everything is sized in container units, so no window shape leaves an empty band. The plate enters from scale 0.82, rotate -40deg, transparent, over 1.2s on cubic-bezier(0.22, 1, 0.36, 1), then turns from -8deg to 40deg as the hero scrolls out (framer-motion). Under reduced motion it rests at -8deg with no entrance. Dish swaps in Menu and Featured cross-fade with a slight scale and fall back to instant swaps under reduced motion; a site-wide reduced-motion rule flattens every CSS transition and animation.

### Counter Screen
The in-store display reuses the same tokens on a pandan field with cream Bungee and a vmin type ramp so it scales to any TV: headline clamp(48px, 9vmin, 260px), details clamp(24px, 3.6vmin, 96px), hint clamp(16px, 2.1vmin, 52px), logo in a cream roundel at clamp(120px, 18vmin, 420px).

## Do's and Don'ts

### Do:
- **Do** give each new section one drenched enamel field and pick a composition that differs from its neighbours.
- **Do** set every headline in Bungee capitals with the painted shadow in the field's complementary enamel.
- **Do** lay a Yellowtail aside across or under the capitals, rotated -5deg to -8deg, stroked in pandan when it overlaps lettering.
- **Do** put food on the field as a transparent cutout with a contact drop-shadow, large enough to overlap a seam, ticket or letter.
- **Do** use pill buttons (cream on red, gold on red or green, ink on gold or cream) for every action, with Order online always reachable.
- **Do** derive any new colour from the five base tokens with color-mix so owner themes keep their contrast.
- **Do** keep reading text at 13px or larger and gold-on-red pairings at display size.
- **Do** give every motion a reduced-motion state that is static and complete.

### Don't:
- **Don't** set sambal text on pandan or pandan text on sambal.
- **Don't** put the painted shadow on body copy, labels, pills or the script used as plain copy.
- **Don't** frame food in photo cards or rectangles; the counter photo is the only print.
- **Don't** return to the cream-paper editorial page: italic serif asides, hairline 1px rules and small tracked uppercase labels belong to the replaced world.
- **Don't** put a dish, price, rating, review quote or "favourite" claim in the ticker, a label or a sticker unless it is a verified menu fact or comes from the live feed.
- **Don't** hard-code an owner-editable colour in a component; read the token so /admin overrides and the contrast guard apply.
