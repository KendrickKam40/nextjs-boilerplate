---
target: components/site
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:/Users/kendrickkam/Desktop/nextjs-boilerplate/components/site"
timestamp: 2026-10-05T12-07-51Z
slug: components-site
closed: true
---
# Critique: components/site (Balibu public site)

Method: dual-agent (A: design review · B: detector + browser). Captured with /api/client returning 503 (no-backend state).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No "open now"; `openStatus` and useRestaurant `status` unused; editorial→live swap silent |
| 2 | Match System / Real World | 2 | "Back to dish", "Collections", "To sip"; flavour tabs are moods, not dishes |
| 3 | User Control and Freedom | 3 | Back/Escape/browser Back/pause all work; back label confusing |
| 4 | Consistency and Standards | 2 | Six labels for one order dialog; ArrowUpRight for internal + external; "FAVOURITES." card vs "Featured dishes" chapter; heading italic red/olive/gold |
| 5 | Error Prevention | 3 | Honest price notes; specials live-only |
| 6 | Recognition Rather Than Recall | 3 | Chapter bar names next chapter; order synonyms need recall |
| 7 | Flexibility and Efficiency | 3 | Persistent dock + deep links |
| 8 | Aesthetic and Minimalist Design | 2 | ~9 taglines on homepage+dock; triple map links in Visit |
| 9 | Error Recovery | 1 | Order iframe shows "Client not found"; onLoad marks ready regardless; backend failure never surfaced |
| 10 | Help and Documentation | n/a | Persuade surface |
| **Total** | | **21/36** | **Acceptable (58%)** |

## Design Specificity Verdict
Visual layer authored for Balibu (logo, real counter photo, ingredient-tinted cards, Anton + Georgia sambal aside, orbiting plate with sweets, card→chapter signature). Structure and copy interchangeable: stock "01 / TAG" editorial scaffold at 7–10px, and greeting-card slogans ("Good food. Good mood.", "Made with heart…") instead of dish names, prices or opening facts. Counter photo shows $12 meal deals and Dirty Soda; site mentions neither.

Detector: 2 warnings, both layout-transition (FeatureSection.module.css:64 `.tab`, MenuSection.module.css:115 `.collection`, padding animated). 178 advisories: 142 off-scale font sizes (7px ×5, 8px ×16, 9px ×14), 32 off-palette colours (near-duplicates #667064, #56634b, #fff5e9/#fffdf4/#fffdf5…), 4 off-scale radii. Browser overlay 19/20/35/29 per view; text-occlusion and clipped-overflow are false positives (inert backdrop / intentional stage clip); cream-palette, italic-serif-display, kicker, wide-tracking are documented brand choices. Real signal: 14 visible elements <11px in first mobile viewport.

## Priority Issues
1. [P1] Menu chapter isn't a menu. Ignores live `menuItems`; editorial fallback has one sentence per category; filter + list + arrows + counter = 3 ways through 5 photos; `collectionFor` regex sends unknown categories (Meal deals, Dirty soda) to curry photo/copy. Fix: live items grouped by category with name/price/sold-out; editorial fallback names real dishes; drop filter and arrows/counter; safer fallback. → distill, clarify
2. [P1] Ordering end moment fragile + no reassurance. Iframe error invisible; no pickup/open-until line. Fix: same-tab provider on ≤700px, prominent new-tab link on desktop, "Pickup at T.29 Esk Eats · Open until 9 pm" from published hours + openStatus, shared Open-now chip. → harden
3. [P1] Admin theme colours are no-ops. RestaurantSite.tsx:170 sets `--b-*`; zero CSS modules read them (~100 hardcoded hexes). Fix: map module colours to tokens with contrast guard, or remove control. → harden, colorize
4. [P2] Sub-11px functional text + contrast gaps. 7–9px labels (Hero.module.css:273, MenuSection.module.css:359, FeatureSection.module.css:258/270/288); "/ COME SAY HELLO" 4.34:1; Featured h2 em #65764f on sage 3.81:1; inactive tab #778569 3.04:1; moss on sage 4.34:1. Fix: 11px label floor (12px mobile), sage-safe ink token. → typeset, polish
5. [P2] One action, six names; earnest not playful copy; "FAVOURITES." implies forbidden claim. Fix: "Order online" everywhere; ArrowRight for in-site; "Back"; "FEATURED DISHES."; cut dock filler; spend playfulness on specifics. → clarify
6. [P2] List rows animate layout (padding transition) and hover == active. Fix: transform-only indent, hover = ink + 4px nudge, scope mobile pill dark fill to active only. → polish

## Persona Red Flags
- Jordan (first-timer): hero dishes unnamed (alt=""); never learns what rendang/ayam geprek are; can't predict "Find your new favourite" = order.
- Casey (mobile, one thumb): 7–9px labels in glare; Menu ticket "Order online" stacked over dock "Order online"; 844×390 landscape hides all four cards below fold.
- Riley (stress): iframe error undetected; theme no-ops; unknown categories get curry; `overflow-wrap:anywhere` breaks long names mid-word.
- Mall shopper at Esk Eats (30 s): open? what's good? how much? Homepage answers none; physical board 10 m away wins.

## Minor Observations
- Visit uses generated food spread; real counter photo (wayfinding) sits in About — swap.
- Hero location button has external "↗" but opens internal chapter (Hero.tsx:57).
- Dock: three competing type columns, 24px serif slogan outweighs 15px CTA; dockHint 8–9px.
- About card switches to Georgia italic, breaking four-card rhythm.
- CardIllustration.tsx unused; useRestaurant `status` unused.
- Photo index pill ~2.3:1 over light cutouts.
- Colour drift #667064/#596452/#56634b should converge to moss-text.

## Questions to Consider
- Would the truth (meal deals, Dirty Soda) convert better in a food court than the editorial fantasy?
- Should The Menu be the menu — live items, prices, sold-out?
- Four doors, or two (Eat, Find us) plus the dock?
