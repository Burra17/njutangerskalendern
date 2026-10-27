import type { IsoDate } from '../types/calendar';

export const STOCKHOLM = 'Europe/Stockholm';

// en-CA formaterar som YYYY-MM-DD.
const isoDateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: STOCKHOLM, year: 'numeric', month: '2-digit', day: '2-digit' });
const offsetFormat = new Intl.DateTimeFormat('en-US', { timeZone: STOCKHOLM, timeZoneName: 'longOffset' });

export function toStockholmDate(instant: Date): IsoDate {
  return isoDateFormat.format(instant);
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
  const name = offsetFormat.formatToParts(new Date(`${date}T12:00:00Z`)).find((part) => part.type === 'timeZoneName')?.value;
  if (!name) throw new Error(`Hittade ingen tidszonsförskjutning för ${date}`);
  return name.replace('GMT', '');
}
