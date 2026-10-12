import { SweetSection } from '@balibu/design-system';

// Shaped like the MaxOrder POS feed (/api/client). Prices are illustrative.
const LIVE_DRINKS = {
  client: {},
  categories: [
    { id: 10, name: 'Milkshakes' },
    { id: 11, name: 'Smoothies' },
    { id: 12, name: 'Slushies' },
    { id: 13, name: 'Sundaes' },
  ],
  menuItems: [
    { id: 'ms', name: 'Strawberry Milkshake', price: 8.5, category: 10, order: 1 },
    { id: 'sm', name: 'Mango Smoothie', price: 9, category: 11, order: 2 },
    { id: 'sl', name: 'Blue Slushie', price: 6.5, category: 12, order: 3 },
    { id: 'su', name: 'Fully Loaded Sundae', price: 10, category: 13, order: 4 },
  ],
};

/** No POS data: the five treats (milkshakes, smoothies, slushies, dirty soda, sundae). */
export const Treats = () => <SweetSection data={null} onOrder={() => {}} />;

/** Live POS data adds a short list of today's sweets with prices. */
export const WithLivePrices = () => <SweetSection data={LIVE_DRINKS} onOrder={() => {}} />;
