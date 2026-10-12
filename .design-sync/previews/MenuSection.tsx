import { MenuSection } from '@balibu/design-system';

// Shaped like the MaxOrder POS feed (/api/client). Prices are illustrative.
const LIVE_MENU = {
  client: { address: 'T.29 Esk Eats, Invercargill Central, 29 Esk Street, Invercargill 9810' },
  categories: [
    { id: 1, name: 'Rice & noodles', order: 1 },
    { id: 2, name: 'Indonesian favourites', order: 2 },
    { id: 3, name: 'Satay & grill', order: 3 },
    { id: 4, name: 'Bakso', order: 4 },
  ],
  menuItems: [
    { id: 'ng', name: 'Nasi Goreng', description: 'Fried rice, fried egg, sambal, cucumber', price: 18.5, category: 1, order: 1 },
    { id: 'mg', name: 'Mie Goreng', description: 'Wok-fried noodles, chicken, greens', price: 18.5, category: 1, order: 2 },
    { id: 'ngs', name: 'Nasi Goreng Special', description: 'With satay skewers and prawn crackers', price: 22, category: 1, order: 3 },
    { id: 'rd', name: 'Chicken Rendang', description: 'Slow-cooked in coconut and spice, with rice', price: 21, category: 2, order: 1 },
    { id: 'ay', name: 'Ayam Penyet', description: 'Smashed crispy chicken, sambal, rice', price: 20, category: 2, order: 2 },
    { id: 'st', name: 'Chicken Satay (6)', description: 'Peanut sauce, red onion, lime', price: 16, category: 3, order: 1 },
    { id: 'bk', name: 'Bakso Soup', description: 'Beef meatballs, noodles, clear broth', price: 17.5, category: 4, order: 1 },
  ],
};

/** No POS data yet: the editorial collections, no prices. */
export const Editorial = () => <MenuSection data={null} onOrder={() => {}} />;

/** Live POS data: cards carry real dishes and prices. */
export const LiveMenu = () => <MenuSection data={LIVE_MENU} onOrder={() => {}} />;
