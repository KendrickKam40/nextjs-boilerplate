import { OpenChip, SiteFrame, Ticker } from '@balibu/design-system';

const Sample = () => (
  <div style={{ display: 'grid', gap: 20, padding: 32 }}>
    <h2 style={{ fontSize: 64 }}>Big flavour. Bali soul.</h2>
    <p style={{ maxWidth: '42ch' }}>Nasi goreng, mie goreng, rendang and bakso. Then a milkshake, because you’ve earned it.</p>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" className="b-pill b-pill--ink">Order online</button>
      <button type="button" className="b-pill b-pill--gold">Book a table</button>
      <OpenChip state={{ open: true, label: 'Open now · until 9 pm' }} />
    </div>
    <Ticker tone="red" words={['Nasi goreng', 'Rendang', 'Bakso']} />
  </div>
);

/** Base palette: coconut cream, pandan green, sambal red, palm-sugar gold. */
export const BaseTheme = () => (
  <SiteFrame>
    <Sample />
  </SiteFrame>
);

/** Owner colours from /admin flow through every token. */
export const OwnerColours = () => (
  <SiteFrame theme={{ primaryColor: '#9c2a5a', secondaryColor: '#f2a541', textColor: '#2a3b5f', headingPrimaryColor: '#2a3b5f' }}>
    <Sample />
  </SiteFrame>
);
