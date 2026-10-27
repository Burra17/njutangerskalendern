import { describe, expect, test } from 'vitest';
import type { GoogleCalendarEvent } from '../types/calendar';
import { addDays } from '../utils/dates';
import { createMockEvents } from './mockEvents';

const now = new Date('2026-06-19T08:00:00Z');
const events = createMockEvents(now);
const startDay = (event: GoogleCalendarEvent) => ('date' in event.start ? event.start.date : event.start.dateTime.slice(0, 10));

describe('createMockEvents', () => {
  test('börjar idag och sträcker sig ungefär tre månader framåt', () => {
    const days = events.map(startDay).sort();
    expect(days[0]).toBe('2026-06-19');
    expect(days.at(-1)! > '2026-08-31').toBe(true);
  });

  test('har unika id:n', () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
  });

  test('har med fallen som omvandlingen och korten ska klara', () => {
    expect(events.some((event) => 'date' in event.start)).toBe(true);
    expect(events.some((event) => 'date' in event.start && 'date' in event.end && event.end.date > addDays(event.start.date, 1))).toBe(true);
    expect(events.some((event) => event.description?.includes('<br>'))).toBe(true);
    expect(events.some((event) => event.description?.includes('</p>'))).toBe(true);
    expect(events.some((event) => event.description?.includes('\nArrangör: '))).toBe(true);
    expect(events.some((event) => !event.location)).toBe(true);
  });

  test('skriver tider med Stockholms förskjutning, som Google gör', () => {
    const fika = events.find((event) => event.id === 'mock-1')!;
    expect(fika.start).toEqual({ dateTime: '2026-06-19T10:00:00+02:00', timeZone: 'Europe/Stockholm' });
  });
});
