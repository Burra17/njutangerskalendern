import type { CalendarEvent, EventTiming, IsoDate } from '../types/calendar';
import { noonUtc, STOCKHOLM, startDay } from './dates';

// Varje serie visas som ett kort: dess första tillfälle, med de följande tillfällena i series.later.
export function mergeSeries(events: CalendarEvent[]): CalendarEvent[] {
  const occurrences = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    if (event.seriesId) occurrences.set(event.seriesId, [...(occurrences.get(event.seriesId) ?? []), event]);
  }

  return events.flatMap((event) => {
    if (!event.seriesId) return [event];
    const [first, ...later] = occurrences.get(event.seriesId)!;
    if (event !== first) return [];
    if (later.length === 0) return [first];
    return [{ ...first, series: { rule: ruleFor([first, ...later].map(startDay)), later: later.map(timing) } }];
  });
}

function timing(event: CalendarEvent): EventTiming {
  return event.allDay ? { allDay: true, startDate: event.startDate, endDate: event.endDate } : { allDay: false, start: event.start, end: event.end };
}

const weekdayFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', timeZone: STOCKHOLM });
const DAY_MS = 24 * 60 * 60_000;

// Google skickar bara tillfällena, inte regeln, så regeln räknas fram ur avstånden mellan dem.
function ruleFor(days: IsoDate[]): string {
  const gaps = days.slice(1).map((day, index) => (Date.parse(day) - Date.parse(days[index])) / DAY_MS);
  const weekday = weekdayFormat.format(noonUtc(days[0]));
  // Det minsta avståndet avgör, så att en inställd vecka inte gör "Varje tisdag" till "Återkommer".
  const smallest = Math.min(...gaps);
  if (smallest === 7 && gaps.every((gap) => gap % 7 === 0)) return `Varje ${weekday}`;
  if (smallest === 14 && gaps.every((gap) => gap % 14 === 0)) return `Varannan ${weekday}`;
  return 'Återkommer';
}
