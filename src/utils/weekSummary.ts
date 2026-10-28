import type { CalendarEvent, EventTiming, IsoDate } from '../types/calendar';
import { addDays, noonUtc, startDay, STOCKHOLM, toStockholmDate } from './dates';

const longDateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: STOCKHOLM });
const shortDateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'short', timeZone: STOCKHOLM });

// Headern svarar på "Vad händer i byn?" (beslut i #49). Mobilen får de korta texterna, så att de ryms på en rad.

// Till exempel 'Onsdag 28 oktober', eller 'Onsdag 28 okt' i kort form. Intl skriver veckodagen med liten bokstav och 'okt.' med punkt.
export function headerDate(now: Date, short = false): string {
  const text = (short ? shortDateFormat : longDateFormat).format(now).replace('.', '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Tillfällen från idag till och med söndag. Alla händelser räknas oavsett filter, och varje tillfälle i en serie för sig.
export function countThisWeek(events: CalendarEvent[], now: Date): number {
  const today = toStockholmDate(now);
  const sunday = addDays(today, daysUntilSunday(today));
  return events.flatMap((event) => [event, ...(event.series?.later ?? [])]).filter((timing) => startDay(timing) <= sunday && lastDay(timing) >= today)
    .length;
}

export function weekCountText(count: number, short = false): string {
  const week = short ? 'i veckan' : 'den här veckan';
  if (count === 0) return `Inget inbokat ${week}.`;
  return `${count} ${count === 1 ? 'sak' : 'saker'} ${short ? '' : 'händer '}${week}.`;
}

// 0 på söndagar, så att veckan då bara är idag.
function daysUntilSunday(date: IsoDate): number {
  return (7 - noonUtc(date).getUTCDay()) % 7;
}

function lastDay(timing: EventTiming): IsoDate {
  return timing.allDay ? timing.endDate : toStockholmDate(timing.end);
}
