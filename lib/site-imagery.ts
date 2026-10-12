// One shared photographic collection across the public restaurant experience.
// Generated editorial assets; provenance and prompts are in docs/assets/.
// These two cutouts use actual online-ordering photographs as their only references.
const ORDERING_MILKSHAKE = {
  src: '/images/brand/floating-ordering-milkshake.png',
  alt: 'A pink milkshake with red syrup and a clear domed lid in a Balibu takeaway cup',
  width: 1254,
  height: 1254,
} as const;
const ORDERING_SUNDAE = {
  src: '/images/brand/floating-ordering-sundae.png',
  alt: 'Balibu’s Fully Loaded Sundae with soft serve, chocolate sauce, colourful sprinkles, a sandwich cookie and a biscuit in a clear cup',
  width: 1254,
  height: 1254,
} as const;

export const FOOD_IMAGES = {
  floatingMilkshake: ORDERING_MILKSHAKE,
  floatingSundae: ORDERING_SUNDAE,
  // Higgsfield (Seedream 5.0 Flash) plates, cut out locally; provenance in docs/assets/higgsfield-plates.md.
  floatingDish: {
    src: '/images/brand/plate-nasi-goreng.png',
    alt: 'Nasi goreng with chicken, a fried egg, sambal, cucumber and lime on a charcoal plate',
    width: 1600,
    height: 1600,
  },
  floatingSatay: {
    src: '/images/brand/plate-chicken-satay.png',
    alt: 'Chicken satay skewers with peanut sauce, red onion, cucumber and lime on a charcoal plate',
    width: 1600,
    height: 1600,
  },
  floatingRendang: {
    src: '/images/brand/plate-chicken-rendang.png',
    alt: 'Chicken rendang in a dark coconut spice sauce with steamed rice and cucumber on a charcoal plate',
    width: 1600,
    height: 1600,
  },
  floatingBakso: {
    src: '/images/brand/plate-bakso.png',
    alt: 'Bakso: beef meatballs, egg noodles and glass vermicelli in clear broth with bok choy and sambal',
    width: 1600,
    height: 1600,
  },
  floatingSmashedChicken: {
    src: '/images/brand/plate-smashed-chicken.png',
    alt: 'Smashed crispy fried chicken topped with red sambal, with rice, cucumber, lettuce and lime',
    width: 1600,
    height: 1600,
  },
  floatingMieGoreng: {
    src: '/images/brand/plate-mie-goreng.png',
    alt: 'Mie goreng noodles with chicken, bok choy, a fried egg, chilli, cucumber and lime on a charcoal plate',
    width: 1600,
    height: 1600,
  },
  cupSmoothie: {
    src: '/images/brand/cup-mango-smoothie.png',
    alt: 'A mango smoothie with whipped cream under a clear dome lid in a Balibu takeaway cup',
    width: 1600,
    height: 1600,
  },
  cupSlushie: {
    src: '/images/brand/cup-blue-slushie.png',
    alt: 'An icy blue slushie under a clear dome lid in a Balibu takeaway cup',
    width: 1600,
    height: 1600,
  },
  cupDirtySoda: {
    src: '/images/brand/cup-dirty-soda.png',
    alt: 'A dirty soda: cola over ice swirled with cream, lime and cream foam, in a Balibu takeaway cup',
    width: 1600,
    height: 1600,
  },
  hero: {
    src: '/images/brand/hero-feast.png',
    alt: 'Indonesian feast with nasi goreng, chicken satay, coconut curry and fresh garnishes on a dark timber table',
    width: 1659,
    height: 948,
  },
  story: {
    src: '/images/brand/indonesian-feast.png',
    alt: 'Indonesian sharing spread with nasi goreng, chicken satay, sambal and fresh garnishes',
    width: 1536,
    height: 1024,
  },
  rice: {
    src: '/images/brand/nasi-goreng.png',
    alt: 'Golden nasi goreng topped with a fried egg, cucumber, lime and sambal in a dark ceramic plate',
    width: 1254,
    height: 1254,
  },
  satay: {
    src: '/images/brand/chicken-satay.png',
    alt: 'Caramelised chicken satay skewers on banana leaves with peanut sauce, cucumber and lime',
    width: 1254,
    height: 1254,
  },
  drinks: ORDERING_MILKSHAKE,
  dessert: ORDERING_SUNDAE,
} as const;
