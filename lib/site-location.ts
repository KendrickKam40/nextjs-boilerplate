/** Public details from https://www.balibu.co.nz/, checked 2 October 2026.
 * Place ID read from the matching public Google Maps listing (same site/phone/address).
 * Public location links only; the site does not fetch Google reviews or Places data.
 */
const VERIFIED_PLACE_ID = 'ChIJc9Ge1QjF0qkR_iGknNBeoKc';

export const BALIBU_LOCATION = {
  name: 'Balibu',
  placeId: VERIFIED_PLACE_ID,
  venue: 'Esk Eats · Invercargill Central',
  address: 'T.29 Esk Eats, Invercargill Central, 39 Esk Street, Invercargill 9810, New Zealand',
  phone: '022 065 4478',
  phoneHref: 'tel:+64220654478',
  hours: ['Monday–Sunday: 10:00 am–9:00 pm'],
  mapsUri: `https://www.google.com/maps/search/?api=1&query=Balibu%2C%2039%20Esk%20Street%2C%20Invercargill%2C%20New%20Zealand&query_place_id=${VERIFIED_PLACE_ID}`,
  directionsUri: `https://www.google.com/maps/dir/?api=1&destination=Balibu%2C%2039%20Esk%20Street%2C%20Invercargill%2C%20New%20Zealand&destination_place_id=${VERIFIED_PLACE_ID}`,
  parkingUri: 'https://www.invercargillcentral.nz/parking',
  sourceUri: 'https://www.balibu.co.nz/',
} as const;

