import type { CalendarEvent } from '../types/calendar';
import { monthKey, noonUtc, startDay, stockholmMidnight } from './dates';

export type MonthGroup = { key: string; title: string; events: CalendarEvent[] };

// UTC och inte Stockholm, eftersom månaden formateras från ett rent datum via noonUtc.
const monthFormat = new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function groupByMonth(events: CalendarEvent[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  // Sorteras här, eftersom ett seriekort och mockdatan inte alltid kommer i ordning.
  for (const event of [...events].sort((a, b) => startTime(a) - startTime(b))) {
    const key = monthKey(startDay(event));
    if (groups.at(-1)?.key !== key) groups.push({ key, title: monthTitle(key), events: [] });
    groups.at(-1)!.events.push(event);
  }
  return groups;
}

function monthTitle(key: string): string {
  const title = monthFormat.format(noonUtc(`${key}-15`));
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function startTime(event: CalendarEvent): number {
  return event.allDay ? Date.parse(stockholmMidnight(event.startDate)) : event.start.getTime();
}
