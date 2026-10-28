import type { CalendarEvent, IsoDate } from '../types/calendar';
import { addDays, endDay, noonUtc, startDay, STOCKHOLM, toStockholmDate, withoutDot } from './dates';

const longDateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: STOCKHOLM });
const shortDateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'short', timeZone: STOCKHOLM });

// Till exempel 'Onsdag 28 oktober', eller 'Onsdag 28 okt' i kort form. Intl skriver veckodagen med liten bokstav och 'okt.' med punkt.
export function headerDate(now: Date, short = false): string {
  const text = withoutDot((short ? shortDateFormat : longDateFormat).format(now));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Tillfällen från idag till och med söndag. Alla händelser räknas oavsett filter, och varje tillfälle i en serie för sig.
export function countRestOfWeek(events: CalendarEvent[], now: Date): number {
  const today = toStockholmDate(now);
  const sunday = addDays(today, daysUntilSunday(today));
  return events.flatMap((event) => [event, ...(event.series?.later ?? [])]).filter((timing) => startDay(timing) <= sunday && endDay(timing) >= today)
    .length;
}

// Den korta formen är för mobilen, så att raden ryms på en rad (beslut i #49).
export function weekCountText(count: number, short = false): string {
  if (short) return count === 0 ? 'Inget inbokat i veckan.' : `${count} ${count === 1 ? 'händelse' : 'händelser'} i veckan.`;
  if (count === 0) return 'Inget inbokat den här veckan.';
  return `${count} ${count === 1 ? 'sak' : 'saker'} händer den här veckan.`;
}

// 0 på söndagar, så att veckan då bara är idag.
function daysUntilSunday(date: IsoDate): number {
  return (7 - noonUtc(date).getUTCDay()) % 7;
}
