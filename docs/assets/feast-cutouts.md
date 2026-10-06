# Balibu floating feast cutouts

Created 2026-10-02 using the built-in image_gen tool with the imagegen skill. Two separate calls used `transparent_background: true`. Original generated files were copied into this project and retained at their original location. Existing assets were not overwritten.

## Deliverables

| Project asset | Dimensions | Format | File bytes | Source output |
| --- | --- | --- | ---: | --- |
| `public/images/brand/floating-chicken-satay.png` | 1254 × 1254 | RGBA PNG | 2,723,874 | `/Users/kendrickkam/.codex/generated_images/01a0fa27-0a06-78d1-a131-3e66df8eb92e/exec-cbf4298b-9ed5-4d0a-a5a9-4bdbce6b4cb7.png` |
| `public/images/brand/floating-coconut-curry.png` | 1254 × 1254 | RGBA PNG | 2,710,607 | `/Users/kendrickkam/.codex/generated_images/01a0fa27-0a06-78d1-a131-3e66df8eb92e/exec-615b2fdb-24b5-4caf-8f68-bacaa7637474.png` |

Both assets were visually inspected. Alpha spans 0–255, all four corners are fully transparent, and no opaque table/background is present. Satay has 511,882 fully transparent pixels; curry has 539,796. The original generated alpha is preserved without post-processing.

## Reference inputs

- Satay: `public/images/brand/chicken-satay.png` (dish reference) and `public/images/brand/floating-nasi-goreng.png` (camera, lighting and ceramics reference).
- Curry: `public/images/brand/indonesian-curry.png` (dish reference) and `public/images/brand/floating-nasi-goreng.png` (camera, lighting and ceramics reference).
- All source images were inspected with view_image before use.

## Final satay prompt

Use case: background-extraction. Asset type: isolated restaurant hero food cutout. Input 1 is the satay dish reference to adapt; Input 2 is the existing nasi goreng cutout showing the exact camera, ceramics, warm lighting and premium photoreal food styling to match. Create one complete centered dark brown-black speckled ceramic ROUND dinner plate containing the same Indonesian chicken satay dish from Input 1: five richly glazed grilled chicken skewers on a banana leaf, crushed peanuts, small peanut sauce ramekin, cucumber, lime, sliced red chili and a little fresh coriander. Reframe to almost directly overhead, matching Input 2. Show the ENTIRE complete round plate and all wooden skewers within frame with a small clear margin. Appetising natural glossy food, realistic char, warm directional light from upper left. The plate and its contents must be a perfectly isolated cutout with genuinely transparent alpha background. No table, no cloth, no extra side bowls outside the plate, no surroundings, no cast shadow outside the dish, no white background, no checkerboard, no text, no logo. Square canvas.

## Final curry prompt

Use case: background-extraction. Asset type: isolated restaurant hero food cutout. Input 1 is the Indonesian coconut curry reference to adapt; Input 2 is the existing nasi goreng cutout showing the exact camera, ceramics, warm lighting and premium photoreal food styling to match. Create one complete centered round low bowl of the same Indonesian coconut chicken curry from Input 1 in dark brown-black speckled ceramic. Rich warm golden-orange coconut sauce, several appetising chicken pieces, glossy green curry leaves, sliced red chili and crispy shallots. Reframe to almost directly overhead, matching Input 2. Show the ENTIRE complete round bowl, contained inside frame with a small clear margin. Realistic food texture, warm directional light from upper left. The bowl and its contents must be a perfectly isolated cutout with genuinely transparent alpha background. Only ONE curry bowl. No rice bowl, no table, no cloth, no scattered props, no extra bowls, no surroundings, no cast shadow outside the bowl, no white background, no checkerboard, no text, no logo. Square canvas.

