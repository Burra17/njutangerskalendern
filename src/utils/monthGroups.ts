import type { CalendarEvent } from '../types/calendar';
import { startDay } from './dates';

export type MonthGroup = { key: string; title: string; events: CalendarEvent[] };

const monthFormat = new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// Händelserna kommer sorterade efter start, så grupperna hamnar i ordning av sig själva.
export function groupByMonth(events: CalendarEvent[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const event of events) {
    const key = startDay(event).slice(0, 7);
    if (groups.at(-1)?.key !== key) groups.push({ key, title: monthTitle(key), events: [] });
    groups.at(-1)!.events.push(event);
  }
  return groups;
}

function monthTitle(key: string): string {
  const title = monthFormat.format(new Date(`${key}-15T12:00:00Z`));
  return title.charAt(0).toUpperCase() + title.slice(1);
}
