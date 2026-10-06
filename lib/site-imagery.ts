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
  floatingDish: {
    src: '/images/brand/floating-nasi-goreng.png',
    alt: 'A floating charcoal plate of Indonesian nasi goreng with a fried egg, cucumber, sambal and lime',
    width: 1254,
    height: 1254,
  },
  floatingSatay: {
    src: '/images/brand/floating-chicken-satay.png',
    alt: 'Chicken satay with peanut sauce, cucumber and lime on a charcoal plate',
    width: 1254,
    height: 1254,
  },
  floatingCurry: {
    src: '/images/brand/floating-coconut-curry.png',
    alt: 'Golden coconut chicken curry with red chilli and aromatic leaves in a charcoal bowl',
    width: 1254,
    height: 1254,
  },
  floatingRendang: {
    src: '/images/brand/floating-rendang.png',
    alt: 'Indonesian beef rendang coated in dark coconut spices on a charcoal ceramic plate',
    width: 1254,
    height: 1254,
  },
  floatingAyamGeprek: {
    src: '/images/brand/floating-ayam-geprek.png',
    alt: 'Crispy smashed ayam geprek with red sambal, steamed rice, cucumber and basil on a charcoal plate',
    width: 1254,
    height: 1254,
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
  curry: {
    src: '/images/brand/indonesian-curry.png',
    alt: 'Golden coconut chicken curry with chilli and aromatic leaves, served beside white rice',
    width: 1254,
    height: 1254,
  },
  dessert: ORDERING_SUNDAE,
} as const;
