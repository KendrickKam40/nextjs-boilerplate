import { Ticker } from '@balibu/design-system';

/** The default menu band (footer seam): dishes and drinks on palm-sugar gold. */
export const MenuWords = () => <Ticker />;

/** Tilted across the hero seam, carrying today's hours and the location. */
export const OpenStatusTilted = () => (
  <div style={{ padding: '48px 0', overflow: 'hidden' }}>
    <Ticker tone="gold" tilt words={['Open now · until 9 pm', 'Esk Eats, Invercargill']} label="Open now until 9 pm at Esk Eats, Invercargill." />
  </div>
);

export const SambalRed = () => <Ticker tone="red" words={['Nasi goreng', 'Rendang', 'Bakso', 'Satay']} />;

export const CoconutCream = () => <Ticker tone="cream" words={['Milkshakes', 'Smoothies', 'Slushies', 'Dirty soda', 'Soft serve']} />;
