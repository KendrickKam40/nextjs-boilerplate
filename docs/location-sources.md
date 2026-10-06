# Balibu location sources

The Visit Us chapter uses the configured restaurant service when available, with Balibu’s own published contact details as a fallback. Google Maps is an external destination for directions, not a live API integration. No Google API key is required.

Checked on **2 October 2026** against [Balibu’s official website](https://www.balibu.co.nz/):

- T.29 Esk Eats, Invercargill Central, 39 Esk Street, Invercargill 9810, New Zealand.
- 022 065 4478; international phone link +64 22 065 4478.
- Monday–Sunday, 10:00 am–9:00 pm. These are published regular hours, not an inferred live open/closed status or holiday guarantee.

The [centre’s dining directory](https://www.invercargillcentral.nz/eat) also lists Esk Eats as open daily, 10 am–9 pm. Parking links to the [centre’s official parking page](https://www.invercargillcentral.nz/parking), so access instructions are maintained by the centre.

The [verified Google Maps listing](https://www.google.com/maps/search/?api=1&query=Balibu%2C%2039%20Esk%20Street%2C%20Invercargill&query_place_id=ChIJc9Ge1QjF0qkR_iGknNBeoKc) matches the same address, phone and `balibu.co.nz` website. Its public Place ID is stored in `lib/site-location.ts` to make the directions link unambiguous.

Update `lib/site-location.ts` if the published details change. Live review fetching and its unused route, hook and display components were removed when the design switched to editorial wording informed by review research. Previous implementation snapshots remain in the ignored design checkpoints.
