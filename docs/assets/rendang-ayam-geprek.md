# Balibu rendang and ayam geprek cutouts

Created 2026-10-02 using the built-in image_gen tool and imagegen skill. Two distinct calls used `transparent_background: true`. Generated originals were copied into the workspace and retained at their original locations. No existing asset was overwritten and no pixel post-processing was applied.

## Deliverables

| Project asset | Dimensions | Format | File bytes | Source output |
| --- | --- | --- | ---: | --- |
| `public/images/brand/floating-rendang.png` | 1254 × 1254 | RGBA PNG | 2,940,742 | `/Users/kendrickkam/.codex/generated_images/01a0fa27-0a06-78d1-a131-3e66df8eb92e/exec-204325fc-2718-44c5-8843-6b651569b22f.png` |
| `public/images/brand/floating-ayam-geprek.png` | 1254 × 1254 | RGBA PNG | 2,827,447 | `/Users/kendrickkam/.codex/generated_images/01a0fa27-0a06-78d1-a131-3e66df8eb92e/exec-2c06a096-4fac-4144-b3d1-ebd26b80630d.png` |

Both generated outputs were visually inspected: complete overhead plates, dark speckled ceramics, matching warm lighting, and no table or text. Rendang shows beef in a thick dark dry spice coating; ayam geprek shows smashed crunchy fried chicken with coarse red sambal, white rice, cucumber and basil. These are generated editorial food illustrations, not photographs of the restaurant's actual plates.

## Transparency validation

- Both alpha channels span 0–255 and contain genuine transparent pixels; original alpha preserved.
- Rendang: 521,258 fully transparent pixels; corner alpha values (top-left, top-right, bottom-left, bottom-right) are 0, 0, 0, 0.
- Ayam geprek: 497,044 fully transparent pixels; corner alpha values are 0, 0, 1, 0. One corner has negligible residual alpha (1/255); no opaque background is present.

## Reference inputs

Both calls referenced `public/images/brand/floating-nasi-goreng.png` and `public/images/brand/floating-coconut-curry.png` only for composition, ceramics, warm lighting and cutout consistency. Both references were inspected with view_image before use.

## Final rendang prompt

Use case: product-mockup. Asset type: isolated restaurant website hero food cutout. The two input images are visual style references ONLY: match their near-direct overhead camera, dark brown-black speckled ceramic, warm upper-left directional light, realistic premium food photography, and clean transparent cutout presentation. Create a DISTINCT new dish: Indonesian beef rendang, several substantial irregular tender beef pieces coated thickly in dark rich caramelized coconut-spice paste, dry and textured with visible fibrous meat and toasted spice flecks, deep mahogany brown appetising sheen. Serve a generous mound in one complete dark speckled shallow round ceramic bowl/plate, with only a tiny garnish of sliced red chili and two green leaves. Rendang is a dry braised beef dish: absolutely NO orange curry soup or pooling watery sauce, NO chicken or egg, NO rice. Entire complete round vessel visible with a small transparent margin on every side, perfectly centered on square canvas. Genuinely transparent alpha background. No table, no cloth, no props, no extra bowls, no outside cast shadow, no checkerboard or white background, no text or logos.

## Final ayam geprek prompt

Use case: product-mockup. Asset type: isolated restaurant website hero food cutout. The two input images are visual style references ONLY: match their near-direct overhead camera, dark brown-black speckled ceramic, warm upper-left directional light, realistic premium food photography, and clean transparent cutout presentation. Create a DISTINCT new dish: Indonesian ayam geprek, one generous smashed crispy fried chicken portion with visibly rough craggy golden crunchy coating, somewhat flattened and torn, topped with vivid coarse red sambal showing chili seeds and bits. Beside it on the SAME plate is a modest compact mound of white steamed rice, three fresh cucumber slices and a small bunch of green basil leaves. Chicken is the largest main focus; clearly crispy fried chicken and hot red sambal, not stewed chicken. Serve on ONE complete dark speckled round ceramic dinner plate. Entire complete plate and food visible with a small transparent margin on every side, perfectly centered on square canvas. Genuinely transparent alpha background. No fried egg, no curry sauce, no skewers, no table, no cloth, no props, no extra bowls, no outside cast shadow, no checkerboard or white background, no text or logos.

