import { Hero } from '@balibu/design-system';

/** The first viewport. Slides advance every 7 s; hover or focus holds them. */
export const OpenNow = () => <Hero openNow={{ open: true, label: 'Open now · until 9 pm' }} onOrder={() => {}} />;

export const Closed = () => <Hero openNow={{ open: false, label: 'Closed · opens 10 am tomorrow' }} onOrder={() => {}} />;
