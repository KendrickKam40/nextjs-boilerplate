import { CommerceDialog } from '@balibu/design-system';

/** Online ordering opened in place over the page. */
export const Order = () => (
  <CommerceDialog mode="order" onClose={() => {}} openNow={{ open: true, label: 'Open now · until 9 pm' }} />
);

export const Booking = () => (
  <CommerceDialog mode="booking" onClose={() => {}} openNow={{ open: false, label: 'Opens 10 am' }} />
);
