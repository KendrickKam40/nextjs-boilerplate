# Balibu ordering-photo cutouts

Created 2 October 2026 with the built-in image_gen tool and the imagegen skill.

The only generation references were product photographs downloaded from [Balibu’s public Uber Eats ordering menu](https://www.ubereats.com/nz/store/balibu/ruAgSzoUUAG1f7EOj4s-BQ), matching Balibu at 39 Esk Street. The direct ordering.balibu.co.nz address returned “Client not found” during source research. No checkout or order was submitted.

No previous website imagery, generated food scene, original category illustration or external style reference was supplied to either generation. The original category-reference approach was stopped before any generation when the user clarified the source requirement.

| Output | Actual ordering reference | Treatment |
| --- | --- | --- |
| `public/images/brand/floating-ordering-milkshake.png` | Milkshake: the fully visible pink cup in the published group photograph | Retains branded tapered takeaway cup, clear dome, pink drink, red syrup and cream topping. Isolated upright with transparent background. |
| `public/images/brand/floating-ordering-sundae.png` | Fully Loaded Sundae | Retains branded clear cup, vanilla/chocolate layers, soft-serve swirl, sprinkles/candies, sandwich cookie and biscuit. Isolated upright with transparent background. |

Both files are 1254 × 1254 RGBA PNGs. They are unchanged copies of the generated outputs; alpha was inspected and preserved. These are generated adaptations of the published product images, not unedited photographs of a serving. Existing source images remain intact.

The original downloaded reference photographs are retained in `docs/assets/ordering-references/`. Exact prompts, source image URLs, generated output locations and metadata are in [ordering-milkshake.json](ordering-milkshake.json) and [ordering-sundae.json](ordering-sundae.json).

The same assets appear in the hero and relevant menu/featured previews. The website supplies cream backdrops, frames and shadows with CSS. Drinks and dessert stay upright; ambient motion can be paused and respects reduced-motion preferences. The previous fruit/coconut dessert wording was replaced to describe the pictured loaded sundae.
