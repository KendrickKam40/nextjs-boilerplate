import type { RestaurantClient } from './site-content';

// Published daily hours (lib/site-location.ts), in Invercargill time.
const PUBLISHED = { open: 10 * 60, close: 21 * 60 };
const ZONE = 'Pacific/Auckland';

export interface OpenState {
  open: boolean;
  label: string;
}

function nzNow(now: Date) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: ZONE,
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    weekday: get('weekday'),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

function minutesFrom(text: string) {
  const match = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(text);
  if (!match) return undefined;
  let hour = Number(match[1]) % 24;
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return hour * 60 + Number(match[2] ?? 0);
}

/** Reads "10:00 am - 9:00 pm" style POS hours; falls back to published hours. */
function todaysHours(client: RestaurantClient | undefined, weekday: string) {
  const raw = client?.openTimes?.[weekday];
  if (typeof raw === 'string' && raw.trim()) {
    if (/closed/i.test(raw)) return null;
    const [start, end] = raw.split(/\s*[-–]\s*|\s+to\s+/i);
    const open = start ? minutesFrom(start) : undefined;
    const close = end ? minutesFrom(end) : undefined;
    if (open !== undefined && close !== undefined) return { open, close };
  }
  return PUBLISHED;
}

function clock(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const display = hour % 12 || 12;
  return `${display}${minute ? `:${String(minute).padStart(2, '0')}` : ''} ${hour < 12 ? 'am' : 'pm'}`;
}

/** Live POS status wins; otherwise the published hours decide. */
export function openState(
  client: RestaurantClient | undefined,
  live: boolean,
  now = new Date(),
): OpenState {
  const { weekday, minutes } = nzNow(now);
  const hours = todaysHours(live ? client : undefined, weekday);
  const withinHours = hours ? minutes >= hours.open && minutes < hours.close : false;
  const open = live && client?.openStatus !== undefined ? Number(client.openStatus) === 1 : withinHours;
  if (open && hours) return { open, label: `Open now · until ${clock(hours.close)}` };
  if (open) return { open, label: 'Open now' };
  if (hours && minutes < hours.open) return { open, label: `Opens ${clock(hours.open)}` };
  if (withinHours) return { open, label: 'Closed right now' };
  return { open, label: `Closed · opens ${clock(PUBLISHED.open)} tomorrow` };
}
