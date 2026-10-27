import type { CalendarEvent, IsoDate } from '../types/calendar';

export const STOCKHOLM = 'Europe/Stockholm';

// en-CA formaterar som YYYY-MM-DD.
const isoDateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: STOCKHOLM, year: 'numeric', month: '2-digit', day: '2-digit' });
const offsetFormat = new Intl.DateTimeFormat('en-US', { timeZone: STOCKHOLM, timeZoneName: 'longOffset' });

// Ett rent datum som tidpunkt mitt på dagen i UTC. Där är det samma datum i alla tidszoner, så det kan formateras utan att hamna på fel dag.
export function noonUtc(date: IsoDate): Date {
  return new Date(`${date}T12:00:00Z`);
}

const shortDateFormat = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// Till exempel '28 okt'. Intl skriver 'okt.', och punkten tas bort.
export function shortDate(date: IsoDate): string {
  return shortDateFormat.format(noonUtc(date)).replace('.', '');
}

export function toStockholmDate(instant: Date): IsoDate {
  return isoDateFormat.format(instant);
}

// Dagen en händelse börjar, i svensk tid.
export function startDay(event: CalendarEvent): IsoDate {
  return event.allDay ? event.startDate : toStockholmDate(event.start);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  // Räknas i UTC, där varje dag har 24 timmar, så att sommar- och vintertid inte påverkar.
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}

// Midnatt i Stockholm, till exempel '2026-06-19T00:00:00+02:00'. Klockan ställs om kl. 02–03, så midnatt har gårdagens förskjutning.
export function stockholmMidnight(date: IsoDate): string {
  return `${date}T00:00:00${stockholmOffset(addDays(date, -1))}`;
}

// Stockholms förskjutning mot UTC den dagen, till exempel '+02:00'. Mitt på dagen, eftersom bytet sker på natten.
export function stockholmOffset(date: IsoDate): string {
  const name = offsetFormat.formatToParts(noonUtc(date)).find((part) => part.type === 'timeZoneName')?.value;
  if (!name) throw new Error(`Hittade ingen tidszonsförskjutning för ${date}`);
  return name.replace('GMT', '');
}
