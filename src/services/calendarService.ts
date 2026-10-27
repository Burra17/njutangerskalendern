import type { CalendarEvent, GoogleCalendarEvent } from '../types/calendar';
import { addDays, stockholmMidnight, toStockholmDate } from '../utils/dates';
import type { CalendarSettings } from './calendarSettings';
import { toCalendarEvent } from './eventMapper';

export type LoadDeps = {
  fetch: (url: string) => Promise<Response>;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  now: Date;
};

// Ungefär ett halvår fram. En veckoaktivitet utan slutdatum fyller annars svaret i flera år framåt.
const DAYS_AHEAD = 183;
// Räcker gott för en by inom ett halvår. Google bläddras inte vidare.
const MAX_RESULTS = 250;

const CACHE_MS = 10 * 60_000;

// Rådata från Google sparas, inte färdiga händelser: Date överlever inte JSON, och en ändrad omvandling slår då igenom direkt.
type CachedResponse = { savedAt: number; items: GoogleCalendarEvent[] };

export async function loadEvents(settings: CalendarSettings, { fetch, storage, now }: LoadDeps): Promise<CalendarEvent[]> {
  const cacheKey = `njutangerskalendern:events:${settings.calendarId}`;
  const cached = readCache(storage.getItem(cacheKey), now);
  if (cached) return toCalendarEvents(cached);

  const response = await fetch(eventsUrl(settings, now));
  if (!response.ok) throw new Error(`Google Calendar svarade ${response.status}: ${await response.text()}`);
  const items = ((await response.json()) as { items?: GoogleCalendarEvent[] }).items ?? [];
  try {
    storage.setItem(cacheKey, JSON.stringify({ savedAt: now.getTime(), items } satisfies CachedResponse));
  } catch {
    // Privat läge eller full lagring: sidan fungerar ändå, den hämtar bara oftare.
  }
  return toCalendarEvents(items);
}

// En händelse som inte går att omvandla hoppas över, så att den inte tar ned hela listan.
function toCalendarEvents(items: GoogleCalendarEvent[]): CalendarEvent[] {
  return items.flatMap((item) => {
    try {
      return [toCalendarEvent(item)];
    } catch (error) {
      console.warn('Hoppar över en händelse som inte gick att omvandla', item, error);
      return [];
    }
  });
}

// Trasig, främmande eller gammal cache räknas som ingen cache.
function readCache(raw: string | null, now: Date): GoogleCalendarEvent[] | null {
  if (!raw) return null;
  try {
    const cached = JSON.parse(raw) as Partial<CachedResponse> | null;
    if (typeof cached?.savedAt !== 'number' || !Array.isArray(cached.items)) return null;
    const age = now.getTime() - cached.savedAt;
    return age >= 0 && age < CACHE_MS ? cached.items : null;
  } catch {
    return null;
  }
}

function eventsUrl({ apiKey, calendarId }: CalendarSettings, now: Date): string {
  const today = toStockholmDate(now);
  const lastDay = addDays(today, DAYS_AHEAD);
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.search = new URLSearchParams({
    key: apiKey,
    timeMin: stockholmMidnight(today),
    timeMax: stockholmMidnight(lastDay),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(MAX_RESULTS),
    fields: 'items(id,recurringEventId,summary,description,location,start,end)',
  }).toString();
  return url.toString();
}
