'use client';

import { ArrowUpRight, Clock3, MapPin, Navigation, Phone } from 'lucide-react';
import type { RestaurantClient } from '@/lib/site-content';
import type { OpenState } from '@/lib/site-hours';
import { BALIBU_LOCATION } from '@/lib/site-location';
import OpenChip from './OpenChip';
import styles from './VisitScene.module.css';

/** Where and when: address, opening hours, phone, map link and order/booking buttons. */
export default function VisitScene({
  client,
  onBooking,
  onOrder,
  openNow = null,
}: {
  client?: RestaurantClient;
  onBooking?: () => void;
  onOrder: () => void;
  openNow?: OpenState | null;
}) {
  const clientHours = Object.entries(client?.openTimes ?? {})
    .filter(([, time]) => typeof time === 'string' && time.trim())
    .map(([day, time]) => `${day}: ${time}`);
  const hours = clientHours.length ? clientHours : [...BALIBU_LOCATION.hours];
  const address = client?.address?.trim() || BALIBU_LOCATION.address;
  const phone = client?.companyNumber?.trim() || BALIBU_LOCATION.phone;
  const phoneHref = phone.replace(/\D/g, '') === BALIBU_LOCATION.phone.replace(/\D/g, '')
    ? BALIBU_LOCATION.phoneHref
    : `tel:${phone.replace(/[^+\d]/g, '')}`;
  const mapsUri = client?.address?.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : BALIBU_LOCATION.mapsUri;
  const directionsUri = client?.address?.trim()
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : BALIBU_LOCATION.directionsUri;
  return (
    <section id="contact" className={styles.section} aria-labelledby="visit-heading">
      <div className={styles.copy}>
        <h2 id="visit-heading" className={styles.heading}>
          Find us on Esk Street.
        </h2>
        <p className={styles.venue}>{BALIBU_LOCATION.venue}</p>
        <OpenChip state={openNow} className={styles.open} />
        <div className={styles.details}>
          <a className={styles.address} href={mapsUri} target="_blank" rel="noopener noreferrer">
            <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
            <span>{address}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <div className={styles.contactActions}>
            <a className={styles.directions} href={directionsUri} target="_blank" rel="noopener noreferrer">
              <Navigation size={16} aria-hidden="true" />Get directions<ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a className={styles.phone} href={phoneHref}>
              <Phone size={17} strokeWidth={1.5} aria-hidden="true" /><span><small>Give us a call</small>{phone}</span>
            </a>
          </div>
          <div className={styles.hours}>
            <h3><Clock3 size={17} strokeWidth={1.5} aria-hidden="true" />Opening hours</h3>
            <ul>{hours.map((line, i) => <li key={`${line}-${i}`}>{line}</li>)}</ul>
            <p className={styles.hoursNote}>Hours from Balibu. Holiday hours may vary.</p>
          </div>
        </div>
        <button type="button" className={`b-pill b-pill--gold ${styles.action}`} data-kind={onBooking ? 'booking' : 'order'} onClick={onBooking ?? onOrder}>
          {onBooking ? 'Book a table' : 'Order online'}
          <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.visual}>
        <aside className={styles.visitNote} aria-labelledby="counter-heading">
          <h3 id="counter-heading">Meet you at the counter.</h3>
          <p>Find us inside Esk Eats at Invercargill Central. Stop in for a meal, or order online and take a little Balibu with you.</p>
          <a href={BALIBU_LOCATION.parkingUri} target="_blank" rel="noopener noreferrer">
            <span><MapPin size={16} aria-hidden="true" />Parking at Invercargill Central</span><ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}
