import { BrandLogo } from '@balibu/design-system';

/** Dark ink on cream: the default, used in the sticky bar and dialogs. */
export const Dark = () => (
  <div style={{ padding: 24, background: 'var(--b-paper)' }}>
    <div style={{ width: 120 }}>
      <BrandLogo tone="dark" />
    </div>
  </div>
);

/** Light lettering for pandan-green and sambal-red fields. */
export const Light = () => (
  <div style={{ padding: 24, background: 'var(--b-ink)' }}>
    <div style={{ width: 120 }}>
      <BrandLogo tone="light" />
    </div>
  </div>
);
