---
name: Balibu
description: Indonesian comfort food at Esk Eats, served as a flavour shop of drenched colour fields, tall condensed capitals and big food cutouts.
colors:
  sambal-red: "#bd2f1b"
  sambal-deep: "#a62918"
  pandan-leaf: "#1d5a35"
  pandan-muted: "#4a7957"
  palm-sugar: "#f6c445"
  coconut-cream: "#fff3df"
  cream-on-pandan-muted: "#cdd1ba"
  pandan-line: "rgba(29, 90, 53, 0.18)"
  open-green: "#3fbf5a"
typography:
  display:
    fontFamily: "'Big Shoulders Display', 'Arial Black', sans-serif"
    fontSize: "min(calc(var(--col) / var(--em) * 0.97), 30cqh)"
    fontWeight: 900
    lineHeight: 0.82
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "'Big Shoulders Display', 'Arial Black', sans-serif"
    fontSize: "clamp(52px, 6.6vw, 116px)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.005em"
  title:
    fontFamily: "'Big Shoulders Display', 'Arial Black', sans-serif"
    fontSize: "clamp(34px, 3vw, 46px)"
    fontWeight: 900
    lineHeight: 0.9
  sign:
    fontFamily: "'Big Shoulders Display', 'Arial Black', sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
  lead:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(15px, 1.2vw, 18px)"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(16px, 1.3vw, 19px)"
    fontWeight: 700
    lineHeight: 1.55
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
  small:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.3
  script:
    fontFamily: "Yellowtail, 'Brush Script MT', cursive"
    fontWeight: 400
    letterSpacing: "0"
rounded:
  card-sm: "24px"
  panel: "28px"
  card: "32px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4.4vw, 72px)"
  section-y: "clamp(64px, 9vw, 140px)"
  section-gap: "clamp(28px, 4vw, 56px)"
  scallop-height: "clamp(28px, 4vw, 56px)"
  scallop-width: "clamp(56px, 8vw, 112px)"
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
    typography: "{typography.sign}"
    padding: "0 clamp(20px, 4.4vw, 72px)"
    height: "{spacing.bar}"
  ticker-band:
    backgroundColor: "{colors.palm-sugar}"
    textColor: "{colors.pandan-leaf}"
    padding: "16px clamp(9px, 1.2vw, 17px)"
  menu-card-red:
    backgroundColor: "{colors.sambal-red}"
    textColor: "{colors.coconut-cream}"
    typography: "{typography.title}"
    rounded: "{rounded.card}"
    padding: "clamp(18px, 1.8vw, 26px)"
    width: "clamp(270px, 28vw, 400px)"
  menu-card-gold:
    backgroundColor: "{colors.palm-sugar}"
    textColor: "{colors.pandan-leaf}"
    typography: "{typography.title}"
    rounded: "{rounded.card}"
    padding: "clamp(18px, 1.8vw, 26px)"
    width: "clamp(270px, 28vw, 400px)"
  menu-card-cream:
    backgroundColor: "{colors.coconut-cream}"
    textColor: "{colors.pandan-leaf}"
    typography: "{typography.title}"
    rounded: "{rounded.card}"
    padding: "clamp(18px, 1.8vw, 26px)"
    width: "clamp(270px, 28vw, 400px)"
  visit-card:
    backgroundColor: "{colors.pandan-leaf}"
    textColor: "{colors.coconut-cream}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 2.6vw, 36px)"
  counter-sticker:
    backgroundColor: "{colors.palm-sugar}"
    textColor: "{colors.pandan-leaf}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
  open-chip:
    textColor: "{colors.coconut-cream}"
    typography: "{typography.small}"
---

# Design System: Balibu

## Overview

**Creative North Star: "The Flavour Shop"**

Balibu is a loud, happy food shop front: whole sections drenched in one flat colour, tall ultra-condensed capitals that fill the width, and real food cut out at huge scale and set straight onto the paint. The page is a run of colour fields (sambal red hero, cream, pandan green menu, cream story, palm-sugar sweets, sambal red visit, pandan footer), stitched by a gold ticker slung at a tilt across the first seam and scalloped edges where the menu and sweets fields rise into the one above. A sticky red sign bar always carries Order online.

Density is loud and low: few words per field, enormous flat lettering, one bold line of Manrope, then a pill. Depth is scale and overlap rather than material: hero dishes sit between their words with a small gap so every letter reads, a plate falls through a giant dish name, the next dish waits out of focus at the hero's edge. Display lettering is flat; there are no painted shadows, outlines or script flourishes on the homepage.

Colours are owner-editable in /admin, so every surface reads from five base tokens and derives the rest. An owner pick that would make text hard to read is ignored and the Balibu colour stays.

**Key Characteristics:**
- Drenched single-colour section fields, never tinted cards on a neutral page.
- Big Shoulders Display at 800 to 900, uppercase, set tight (0.8 to 0.9) and flat.
- Food as transparent cutouts on the field at hero scale, never framed photo cards.
- Colour cards (red, gold, cream) as the one repeated container, on a sideways rail.
- Scalloped top edges and a tilted ticker band to join fields.
- Manrope 700 for every word that is read rather than seen: copy, pills, prices.

## Colors

Four shop-front enamels at full saturation, with coconut cream as the lettering colour and pandan green doing the work of ink.

### Primary
- **Sambal Red** (sambal-red): the hero's first slide, the Visit field, the sticky sign bar, the browser theme colour, one of the three menu card colours, and heading colour on cream (Story) and gold (Sweets). Carries cream lettering (5.3:1).
- **Sambal Deep** (sambal-deep): darker sambal for small accent text on cream in the order and booking dialog. Derived as 88% sambal mixed with black.

### Secondary
- **Pandan Leaf** (pandan-leaf): the ink of the system. The hero's second slide, the Menu field, the footer, the Visit card, body text on cream and gold, ticker text, the focus ring's outer band. Owner-editable as "Text and dark panels"; the resolver falls back to near-black (#191a17) if a custom page background leaves it under 7:1.

### Tertiary
- **Palm Sugar** (palm-sugar): the hero's third slide, the Sweets field, the ticker band, menu cards, the counter sticker, the nav hover underline, footer accents, address underline and the focus ring.

### Neutral
- **Coconut Cream** (coconut-cream): lettering on red and green, the GiantWord and Story fields, the cream menu card, the logo roundel, pills on red.
- **Pandan Muted** (pandan-muted): secondary text on cream (GiantWord explainer, story copy, captions). Derived as 80% pandan into cream.
- **Cream on Pandan Muted** (cream-on-pandan-muted): secondary text on green (menu intro and note, footer small print, visit card copy). Derived as 78% cream into pandan.
- **Pandan Line** (pandan-line): the 2px rule above the story copy. Rules on coloured cards and fields instead mix currentColor at 30% to 45% into transparent, 2px dashed.
- **Open Green** (open-green): only the lit dot of the open chip when the counter is open, with a 3px 30% halo.

### Named Rules
**The Drenched Field Rule.** Every section is one flat field of a single enamel, edge to edge. Fields meet at a hard seam, a scalloped edge, or the tilted ticker, never a gradient. The hero is the one field that changes colour, cross-fading red to green to gold with its slides.

**The No Red-on-Green Rule.** Sambal and pandan are never set as text and ground for each other (1.4:1). Red headings sit on cream or gold; green fields carry cream.

**The Gold Is Large Rule.** Palm sugar on sambal and sambal on palm sugar (3.6:1) appear only at display or title sizes (the Sweets heading, a red-toned ticker). They are not reading-copy colours. Palm sugar is never a text colour on cream (about 1.5:1).

**The Derived Tokens Rule.** Only the five owner-editable bases are literal. Muted text, rules and on-colours are color-mix derivations of them, so an owner theme keeps its contrast. On-accent text is chosen by the resolver from cream, white or near-black, whichever reads best on the owner's red.

## Typography

**Display Font:** Big Shoulders Display, variable 100 to 900 (with 'Arial Black', sans-serif), self-hosted.
**Body Font:** Manrope 400 and 700 (with Arial, sans-serif), self-hosted.
**Script Font:** Yellowtail (with 'Brush Script MT', cursive), self-hosted; used only on the coming-soon gate and the in-store counter screen.

**Character:** Big Shoulders is the shop sign: tall, ultra-condensed capitals that can fill a viewport width with two words and still leave room for a plate between them. Manrope stays out of the way and does almost all its work at 700.

### Hierarchy
- **Display** (Big Shoulders 900, 0.82, -0.005em, uppercase): the hero's two words either side of the dish. Each slide carries `--em` (its widest word's advance at 1em), and size is the column beside the dish divided by `--em`, capped at 30cqh, so the widest word always fills its side exactly. Stacked below 900px at 20cqw (18.5cqw under 700px). The same role sets the giant dish name ("NASI GORENG", 19.6cqw, 0.8; 33cqw stacked on phones).
- **Headline** (Big Shoulders 900, 0.86, -0.005em, uppercase, balanced): section heads sized per field, from clamp(52px, 6.6vw, 116px) on Story to clamp(64px, 10vw, 168px) on Menu, held to 9ch to 11ch so they break into two or three stacked lines.
- **Title** (Big Shoulders 900, clamp(34px, 3vw, 46px), 0.9, uppercase): menu card names and sweet names (to clamp(32px, 3.2vw, 52px)); the GiantWord explainer heading (clamp(30px, 3.4vw, 52px), 0.95) and visit card heading (clamp(26px, 2.6vw, 40px), 1) are the same role.
- **Sign** (Big Shoulders 800 to 900, uppercase): nav links (19px, 800, 0.02em), the ticker (clamp(26px, 3.4vw, 50px), 900), the counter sticker (20px), venue and hours heads (18px to 24px).
- **Lead** (Manrope 700, clamp(15px, 1.2vw, 18px), 1.45): the hero's line of copy, within 26cqw on desktop and 34ch on phones.
- **Body** (Manrope 700, clamp(16px, 1.3vw, 19px), 1.5 to 1.65, 30ch to 50ch): section intros, explainer, story copy, visit details. Card descriptions and price rows run at 15px to 16px.
- **Label** (Manrope 700, 15px, line-height 1): all pill text; 13px in the sign bar. Prices take tabular numerals.
- **Small** (Manrope 700, 13px): open chip, captions, hours note, footer small print. 12px is used only for the phone pill's sub-line.

### Named Rules
**The Flat Capitals Rule.** Display lettering carries no text-shadow, outline or stroke. Its weight, height and the colour field do the shouting.

**The Sign Reads, Manrope Acts Rule.** Big Shoulders is for things you see (words, names, nav, ticker, sticker). Anything you press or read as a sentence (pills, copy, prices, chips) is Manrope 700.

## Layout

One long scroll of full-bleed fields. Horizontal padding is a single fluid gutter (clamp(20px, 4.4vw, 72px)); vertical field padding is clamp(64px, 9vw, 140px), or clamp(56px, 7vw, 110px) top under a scalloped edge, with clamp(28px, 4vw, 56px) between blocks. There is no centred max-width container: lettering is sized to the viewport or its container (container queries and cq units throughout) and runs gutter to gutter.

Compositions alternate so neighbours never repeat. Hero: a three-column grid (word, dish, word) vertically centred at 47%, the dish about 1.4cqw clear of each word, copy and order pill bottom-left, progress bars and location bottom-right. GiantWord: the dish name spans the full width, the plate overlaps it, the explainer sits in the right half. Menu: heading and intro on one baseline row, then a horizontal snap rail of cards that bleeds past the gutter. Story: two columns, copy then counter photo (1fr / 1.05fr). Sweets: a heading row, then two huge cutouts side by side, then live price rows. Visit: two equal columns of details and the green visit card.

Breakpoints: at 900px multi-column fields collapse to one column, the nav hides, and the hero stacks (both words on one line, dish below at up to 520px, copy then controls). At 700px the bar shrinks to 64px, its order pill moves to a fixed full-width gold Order bar at the bottom over a pandan fade (with safe-area insets), menu cards become 78vw, sweets stack, and secondary order pills inside sections hide.

The hero's height is clamp(580px, 100svh minus the bar, 62vw). The sticky sign bar sets the scroll-margin for every deep-linked section.

## Elevation & Depth

Flat paint. Fields and cards have no shadows. Depth comes from overlap and focus: food cutouts with soft contact shadows sitting over seams and the giant dish name, the blurred next dish at the hero's corner, and the tilted ticker casting a faint shadow onto the field below. Box shadows appear only on that ticker and on things that genuinely overlay content.

### Shadow Vocabulary
- **Food contact** (`filter: drop-shadow(0 28px 26px #0005)`, ranging to `drop-shadow(0 18px 16px #0004)` on menu cards): every transparent food cutout.
- **Banner lift** (`box-shadow: 0 10px 24px #0002`): the tilted ticker across the hero seam.
- **Overlay** (`box-shadow: 0 10px 24px #0004`): the fixed mobile order pill over scrolling content.
- **Out of focus** (`filter: blur(14px); opacity: 0.85`): the next slide's dish peeking from the hero's top-right.
- **Focus** (`outline: 3px solid <palm sugar>; outline-offset: 3px; box-shadow: 0 0 0 6px <pandan>`): every focusable element on the site.

### Named Rules
**The Cutout Not Card Rule.** Food is a transparent cutout placed directly on a field or a colour card with a contact shadow, allowed to overlap words and seams. It never sits in a framed photo card. The one rectangular photograph is the real counter in Story.

## Shapes

Three shapes carry the world: the fully round pill (999px) for every button, the counter sticker and the progress bars' ends; the generously rounded colour card (32px, 26px on phones) for menu cards and the counter photo (24px on phones); and the semicircle scallop, a repeat-x radial gradient in the field's own colour that sits on the seam above Menu and Sweets (clamp(56px, 8vw, 112px) wide, clamp(28px, 4vw, 56px) tall). The visit card is 28px with no border. The logo sits in a cream circle; carousel arrows and the hero pause control are 2px-ringed circles. Rules are 2px, dashed inside cards and lists, solid above story copy. Tilts keep it lively: the ticker at -2.2deg, the counter sticker at -3deg, dishes at -6deg to -10deg, the logo -8deg and pills -1.5deg on hover.

## Components

### Buttons
Shop-counter pills: chunky, round, slightly tipped when you reach for them.
- **Shape:** full pill (999px), 2px border in the fill colour, min-height 52px (46px in the bar, 56px on the mobile order bar), 0 26px padding, 12px gap to an arrow icon. Manrope 700 15px.
- **Cream:** coconut cream with sambal text; the primary action on red fields and in the sign bar. On the hero's gold slide it swaps to ink.
- **Gold:** palm sugar with pandan text; actions on green fields and the mobile order bar.
- **Ink:** pandan with cream text; actions on gold and cream fields.
- **Hover / Focus:** on hover-capable devices, translateY(-2px) rotate(-1.5deg) over 180ms cubic-bezier(0.22, 1, 0.36, 1), arrow nudges 2px up-right; active scales to 0.98; gold-and-pandan focus ring.
- **Outline pills (Visit contact):** Directions and phone carry a 2px cream border; Directions filled cream with sambal text, turning gold on hover; phone fills with 14% cream on hover.
- **Round controls:** 52px circles with a 2px cream ring for the menu rail arrows, filling cream on hover.

### Chips
- **Open chip:** Manrope 700 13px with a 9px dot. Closed: dot in currentColor at 55% opacity. Open: dot in open green with a 3px halo. Inherits the colour of the field it sits on; used in the hero, Visit and footer.

### Cards / Containers
- **Menu card:** one collection per card, cycling sambal, palm sugar and cream, 32px corners, clamp(18px, 1.8vw, 26px) padding, no border or shadow. A square dish cutout bleeds 4% past the card's top and sides; name in Title; live items as 2px-dashed price rows with tabular prices and struck-through sold-out items. On hover the dish turns -8deg and grows 4% over 500ms.
- **Visit card:** a solid pandan block (28px corners) on the red field with cream title, muted cream copy and a link row above a 2px dashed rule.

### Navigation
- **Sign bar:** sticky, 72px, sambal field with cream text and a 2px 22% cream bottom rule. Logo in a 56px cream roundel (tilts -8deg on hover), Big Shoulders 19px links with a 3px gold underline that wipes in from the left on hover, and a cream Order pill at the end. Below 900px links hide; below 700px the bar order pill moves to the fixed bottom bar.

### Hero Slideshow (signature)
One dish at a time between two words, on its own field: nasi goreng on sambal red, rendang on pandan, a milkshake on palm sugar. Each slide holds 7s; the field cross-fades over 1.2s on cubic-bezier(0.22, 1, 0.36, 1) while the outgoing dish slides off left turning to -50deg, the new one slides in from the right from 40deg to rest at -10deg (-6deg for the shake), and the words rise 30% into place. The next dish waits blurred at the top-right corner. Progress bars (4px, 30% track, current one filling linearly over the hold) and a ringed pause button sit bottom-right with the open chip and location link. Autoplay pauses on hover, keyboard focus, a hidden tab or the pause button, and never runs under reduced motion, where slides swap instantly.

### Ticker Band
A banner of what is cooking and when: Big Shoulders 900 capitals at clamp(26px, 3.4vw, 50px) with sambal four-point stars between words, rolling left on a 42s linear loop, paused on hover, stopped under reduced motion. Palm sugar with pandan by default (red and cream tones exist). The first one is slung at -2.2deg across the hero seam, 106% wide, overlapping both fields by 34px (22px on phones), and carries the live open status and the venue (Esk Eats, Invercargill). A flat one of menu words sits above the footer.

### GiantWord
A cream field where "NASI GORENG" spans the full width (two stacked lines on phones), with the plate dropping through it on scroll (y -28% to 22%, rotate -24deg to 30deg, framer-motion; static under reduced motion) and a short explainer below right.

### Counter Sticker
The real counter photograph in Story carries a gold pill label in Big Shoulders 20px at its lower left, tipped -3deg, with a provenance caption below.

### Counter Screen
The in-store display reuses the tokens on a pandan field with cream Big Shoulders 900 and a vmin type ramp so it scales to any TV: headline clamp(48px, 9vmin, 260px) with a Yellowtail aside at 1.12em, details clamp(24px, 3.6vmin, 96px), hint clamp(16px, 2.1vmin, 52px), logo in a cream roundel at clamp(120px, 18vmin, 420px).

## Do's and Don'ts

### Do:
- **Do** give each new section one drenched enamel field and a composition that differs from its neighbours.
- **Do** set headings in Big Shoulders Display 900, uppercase, line-height 0.82 to 0.9, flat.
- **Do** size big words from their container (cq units, or `--em` against the available column) so they fill their width at every window shape.
- **Do** put food on the field or a colour card as a transparent cutout with a contact drop-shadow, large enough to overlap a word or seam.
- **Do** use Manrope 700 pills (cream on red, gold on green, ink on gold or cream) for every action, with Order online always reachable.
- **Do** join a field to the one above with a scalloped edge or the tilted ticker when the seam needs character.
- **Do** derive any new colour from the five base tokens with color-mix so owner themes keep their contrast.
- **Do** give every motion a reduced-motion state that is static and complete, and let autoplay be paused.

### Don't:
- **Don't** set sambal text on pandan or pandan text on sambal.
- **Don't** add text-shadows, strokes or painted outlines to display lettering.
- **Don't** set pills, prices or reading copy in the display face.
- **Don't** frame food in photo cards or rectangles; the counter photo is the only print.
- **Don't** put a dish, price, rating, review quote or "favourite" claim in the ticker, a card or a sticker unless it is a verified menu fact or comes from the live feed.
- **Don't** hard-code an owner-editable colour in a component; read the token so /admin overrides and the contrast guard apply.

### Voice note

Refer to the location as Esk Eats or Esk Eats, Invercargill Central. The counter number "T.29" appears only inside the full street address, never as a slogan or label.
