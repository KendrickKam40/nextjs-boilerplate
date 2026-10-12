import { VisitScene } from '@balibu/design-system';

/** Address, hours and phone fall back to Balibu's real details when the POS sends none. */
export const OpenNow = () => <VisitScene openNow={{ open: true, label: 'Open now · until 9 pm' }} onOrder={() => {}} />;

/** With bookings switched on, the main action becomes "Book a table". */
export const WithBooking = () => (
  <VisitScene openNow={{ open: false, label: 'Opens 10 am' }} onBooking={() => {}} onOrder={() => {}} />
);
