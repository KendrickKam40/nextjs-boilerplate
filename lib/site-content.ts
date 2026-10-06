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
    image: FOOD_IMAGES.floatingDish.src,
    imageAlt: FOOD_IMAGES.floatingDish.alt,
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
    name: 'Smoothies & shakes',
    description: 'Milkshakes, smoothies and icy slushies. Brain freeze optional.',
    image: FOOD_IMAGES.floatingMilkshake.src,
    imageAlt: FOOD_IMAGES.floatingMilkshake.alt,
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
  image: FOOD_IMAGES.floatingCurry.src,
  imageAlt: FOOD_IMAGES.floatingCurry.alt,
  kind: 'savoury',
};

export const BRAND_STORY =
  'Find a little Indonesian comfort at Esk Eats, right here in Invercargill. From nasi goreng and mie goreng to chicken dishes and noodle soup, our menu has plenty to settle into. Come for a meal, stop by for a milkshake or slushie, or finish with ice cream. There’s a warm welcome waiting at the counter.';

export function collectionFor(name: string): MenuCollection {
  const key = name.toLowerCase();
  if (/smooth|shake|drink|slush|soda|juice|coffee|tea/.test(key)) return MENU_COLLECTIONS[3];
  if (/cream|yoghurt|sundae|sweet|dessert/.test(key)) return MENU_COLLECTIONS[4];
  if (/rice|noodle|goreng|bakso/.test(key)) return MENU_COLLECTIONS[1];
  if (/satay|grill/.test(key)) return MENU_COLLECTIONS[2];
  if (/rendang|curry|indonesia/.test(key)) return MENU_COLLECTIONS[0];
  return OTHER_COLLECTION;
}
