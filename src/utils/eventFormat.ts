import type { CalendarEvent, EventTiming } from '../types/calendar';
import { addDays, noonUtc, shortDate, startDay, STOCKHOLM, toStockholmDate } from './dates';

export type DateBadge = { label: string; day: number; level: 'strong' | 'soft' | 'normal' };

// UTC, eftersom veckodagen formateras från ett rent datum via noonUtc.
const weekdayFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', timeZone: 'UTC' });
const clockFormat = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: STOCKHOLM });

// Datumrutan: Pågår går före Idag, som går före Imorgon. Pågår och Idag väger tyngst.
export function dateBadge(event: CalendarEvent, now: Date): DateBadge {
  const today = toStockholmDate(now);
  const day = startDay(event);
  const ongoing = event.allDay ? event.startDate < today && event.endDate >= today : event.start <= now && now < event.end;
  const dayOfMonth = Number(day.slice(8));
  if (ongoing) return { label: 'Pågår', day: dayOfMonth, level: 'strong' };
  if (day === today) return { label: 'Idag', day: dayOfMonth, level: 'strong' };
  if (day === addDays(today, 1)) return { label: 'Imorgon', day: dayOfMonth, level: 'soft' };
  return { label: weekdayFormat.format(noonUtc(day)).replace('.', ''), day: dayOfMonth, level: 'normal' };
}

export function timeRange(event: CalendarEvent): string {
  if (event.allDay) {
    if (event.startDate === event.endDate) return 'Heldag';
    const sameMonth = event.startDate.slice(0, 7) === event.endDate.slice(0, 7);
    return `${sameMonth ? Number(event.startDate.slice(8)) : shortDate(event.startDate)}–${shortDate(event.endDate)}`;
  }
  const [startDate, endDate] = [toStockholmDate(event.start), toStockholmDate(event.end)];
  const [startClock, endClock] = [clockFormat.format(event.start), clockFormat.format(event.end)];
  // En kväll som slutar efter midnatt, men före kl. 06, är fortfarande samma kväll.
  const sameEvening = endDate === addDays(startDate, 1) && endClock < '06:00';
  if (startDate === endDate || sameEvening) return `${startClock}–${endClock}`;
  return `${shortDate(startDate)} ${startClock}–${shortDate(endDate)} ${endClock}`;
}

export function shortPlace(location: string): string {
  return location.split(',')[0].trim();
}

// Kortet visar högst tre av seriens följande tillfällen.
export function alsoOn(later: EventTiming[]): string {
  const dates = later.slice(0, 3).map((timing) => shortDate(startDay(timing)));
  const list = dates.length < 2 ? dates[0] : `${dates.slice(0, -1).join(', ')} och ${dates.at(-1)}`;
  return `Även ${list}.`;
}
