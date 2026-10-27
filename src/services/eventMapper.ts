import type { CalendarEvent, EventTiming, GoogleCalendarEvent } from '../types/calendar';
import { categorize } from '../utils/categoryParser';
import { addDays } from '../utils/dates';
import { extractOrganizer, toPlainText } from '../utils/descriptionText';

export function toCalendarEvent(event: GoogleCalendarEvent): CalendarEvent {
  const title = nonEmpty(event.summary) ?? 'Händelse';
  // Arrangören tas bort före kategorin, eftersom den säger vem och inte vad.
  const { organizer, text } = extractOrganizer(toPlainText(event.description ?? ''));
  return {
    id: event.id,
    title,
    description: nonEmpty(text),
    location: nonEmpty(event.location),
    organizer,
    category: categorize(title, text),
    ...toTiming(event),
  };
}

// Korten ska aldrig behöva skilja på tom text och text som saknas.
function nonEmpty(text: string | undefined): string | undefined {
  return text?.trim() || undefined;
}

// Heldagar förblir rena datum. Googles slutdatum är dagen efter sista dagen och räknas om.
function toTiming({ start, end }: GoogleCalendarEvent): EventTiming {
  if ('date' in start && 'date' in end) return { allDay: true, startDate: start.date, endDate: addDays(end.date, -1) };
  if ('dateTime' in start && 'dateTime' in end) return { allDay: false, start: new Date(start.dateTime), end: new Date(end.dateTime) };
  throw new Error('Start och slut har olika form');
}
