import type { CalendarEvent } from '../types/calendar';
import { categoryById, type SelectedCategory } from './categoryParser';

// Varje ord i sökningen måste finnas någonstans i händelsen, men inte i följd eller i samma fält.
export function searchEvents(events: CalendarEvent[], query: string): CalendarEvent[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return events;
  return events.filter((event) => {
    const text = normalize(searchableText(event));
    return words.every((word) => text.includes(word));
  });
}

export function filterByCategory(events: CalendarEvent[], category: SelectedCategory): CalendarEvent[] {
  return category ? events.filter((event) => event.category === category) : events;
}

function searchableText(event: CalendarEvent): string {
  return [event.title, event.description, event.location, event.organizer, categoryById(event.category).label].join('\n');
}

// Å, ä och ö jämförs som egna bokstäver. NFC gör bara att o plus prickar blir samma ö som tangenten ö.
function normalize(text: string): string {
  return text.normalize('NFC').toLowerCase();
}
