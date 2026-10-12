import type { LayoutConfig } from './layout-config';
import { FOOD_IMAGES } from './site-imagery';

export type CommerceMode = 'order' | 'booking' | null;

export interface RestaurantClient {
  aboutUs?: string;
  appDescription?: string;
  address?: string;
  companyNumber?: string;
  openTimes?: Record<string, string>;
  openStatus?: number;
  bookingAccess?: boolean;
  kioskMessage?: string;
  announceTitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headingPrimaryColor?: string;
  headingSecondaryColor?: string;
  textColor?: string;
  coverTextColor?: string;
  backgroundColor?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string | number;
  image?: string;
  showCase?: boolean;
  order?: number;
  soldOut?: number;
  avalible?: number;
}

export interface RestaurantData {
  client: RestaurantClient;
  menuItems: MenuItem[];
  categories: { id?: string | number; name: string; visible?: boolean; order?: number }[];
  layout?: LayoutConfig;
  /** Colours staff explicitly set in /admin; POS colours are not applied. */
  themeOverrides?: Partial<Record<string, string>>;
  source?: string;
}

export type CollectionKind = 'savoury' | 'sweet' | 'drinks';
export interface MenuCollection {
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  kind: CollectionKind;
}

// Editorial collections, not a substitute for live prices or availability.
// Editorial collections, not a substitute for live prices or availability.
// Each uses a transparent cutout so the food can sit straight on the painted field.
export const MENU_COLLECTIONS: MenuCollection[] = [
  {
    name: 'Indonesian favourites',
    description: 'Chicken rendang with rice and other properly spiced, slow-cooked plates.',
    image: FOOD_IMAGES.floatingRendang.src,
    imageAlt: FOOD_IMAGES.floatingRendang.alt,
    kind: 'savoury',
  },
  {
    name: 'Rice & noodles',
    description: 'Nasi goreng, mie goreng, and bakso when you need a bowl of noodle soup with meatballs.',
    image: FOOD_IMAGES.floatingMieGoreng.src,
    imageAlt: FOOD_IMAGES.floatingMieGoreng.alt,
    kind: 'savoury',
  },
  {
    name: 'From the grill',
    description: 'Chicken satay with peanut sauce. Smoky, saucy, and you will want another skewer.',
    image: FOOD_IMAGES.floatingSatay.src,
    imageAlt: FOOD_IMAGES.floatingSatay.alt,
    kind: 'savoury',
  },
  {
    name: 'Soups & bakso',
    description: 'Bakso, meatballs and noodles in a clear, savoury broth. Comfort in a bowl.',
    image: FOOD_IMAGES.floatingBakso.src,
    imageAlt: FOOD_IMAGES.floatingBakso.alt,
    kind: 'savoury',
  },
  {
    name: 'Crispy & smashed chicken',
    description: 'Crunchy fried chicken, smashed and loaded with sambal, with rice on the side.',
    image: FOOD_IMAGES.floatingSmashedChicken.src,
    imageAlt: FOOD_IMAGES.floatingSmashedChicken.alt,
    kind: 'savoury',
  },
  {
    name: 'Smoothies & shakes',
    description: 'Milkshakes, smoothies and icy slushies. Brain freeze optional.',
    image: FOOD_IMAGES.cupSmoothie.src,
    imageAlt: FOOD_IMAGES.cupSmoothie.alt,
    kind: 'drinks',
  },
  {
    name: 'Something sweet',
    description: 'Ice cream, soft serve and the Fully Loaded Sundae. Dessert first is allowed.',
    image: FOOD_IMAGES.floatingSundae.src,
    imageAlt: FOOD_IMAGES.floatingSundae.alt,
    kind: 'sweet',
  },
];

// Live categories the editorial set cannot describe get neutral copy and a shared image.
const OTHER_COLLECTION: MenuCollection = {
  name: '',
  description: 'See what’s in this section today.',
  image: FOOD_IMAGES.floatingDish.src,
  imageAlt: FOOD_IMAGES.floatingDish.alt,
  kind: 'savoury',
};

export const BRAND_STORY =
  'Find a little Indonesian comfort at Esk Eats, right here in Invercargill. From nasi goreng and mie goreng to chicken dishes and noodle soup, our menu has plenty to settle into. Come for a meal, stop by for a milkshake or slushie, or finish with ice cream. There’s a warm welcome waiting at the counter.';

export function collectionFor(name: string): MenuCollection {
  const key = name.toLowerCase();
  const byName = (n: string) => MENU_COLLECTIONS.find((c) => c.name === n)!;
  if (/smooth|shake|drink|slush|soda|juice|coffee|tea/.test(key)) return byName('Smoothies & shakes');
  if (/cream|yoghurt|sundae|sweet|dessert/.test(key)) return byName('Something sweet');
  if (/bakso|soto|soup|broth/.test(key)) return byName('Soups & bakso');
  if (/smash|geprek|crispy|fried chicken/.test(key)) return byName('Crispy & smashed chicken');
  if (/rice|noodle|goreng|mie|meal/.test(key)) return byName('Rice & noodles');
  if (/satay|grill/.test(key)) return byName('From the grill');
  if (/rendang|beef|chicken|indonesia/.test(key)) return byName('Indonesian favourites');
  return OTHER_COLLECTION;
}

export interface Dish {
  name: string;
  /** One plain line on what's in it. Draft copy from the photos; owner to confirm. */
  line: string;
  image: { src: string; width: number; height: number };
  /** Degrees the cutout leans on its tile. */
  tilt: number;
  /** Takes two grid columns. */
  wide?: boolean;
}

// Homepage dish tiles. Every tile opens online ordering; no prices here.
export const SAVOURY_DISHES: Dish[] = [
  { name: 'Nasi goreng', line: 'Wok-fried rice with chicken, a fried egg and sambal.', image: FOOD_IMAGES.floatingDish, tilt: -6 },
  { name: 'Mie goreng', line: 'Fried egg noodles with chicken, bok choy and a fried egg.', image: FOOD_IMAGES.floatingMieGoreng, tilt: 5 },
  { name: 'Chicken rendang', line: 'Chicken slow-cooked in coconut and spices, with rice.', image: FOOD_IMAGES.floatingRendang, tilt: -4 },
  { name: 'Bakso', line: 'Beef meatball soup with noodles and bok choy.', image: FOOD_IMAGES.floatingBakso, tilt: 6 },
  { name: 'Chicken satay', line: 'Grilled chicken skewers with peanut sauce.', image: FOOD_IMAGES.floatingSatay, tilt: -5 },
  { name: 'Crispy smashed chicken', line: 'Fried chicken, smashed flat, with sambal and rice.', image: FOOD_IMAGES.floatingSmashedChicken, tilt: 4 },
];

export const SWEET_DISHES: Dish[] = [
  { name: 'Milkshakes', line: 'Thick and cold, with cream on top.', image: FOOD_IMAGES.floatingMilkshake, tilt: -5 },
  { name: 'Smoothies', line: 'Blended fruit, whipped cream on top.', image: FOOD_IMAGES.cupSmoothie, tilt: 4 },
  { name: 'Slushies', line: 'Icy, bright and very cold.', image: FOOD_IMAGES.cupSlushie, tilt: -4 },
  { name: 'Dirty soda', line: 'Cola, cream and a squeeze of lime.', image: FOOD_IMAGES.cupDirtySoda, tilt: 5 },
  {
    name: 'Soft serve & the Fully Loaded Sundae',
    line: 'Soft serve, chocolate sauce, sprinkles and biscuits.',
    image: FOOD_IMAGES.floatingSundae,
    tilt: -3,
    wide: true,
  },
];
