import { describe, expect, test } from 'vitest';
import type { CalendarEvent, EventTiming } from '../types/calendar';
import { countRestOfWeek, headerDate, weekCountText } from './weekSummary';

// Onsdag 28 oktober 2026 kl. 12:00 i Stockholm. Veckan är alltså onsdag till söndag 1 november.
const wednesday = new Date('2026-10-28T11:00:00Z');

function day(date: string, extra: { endDate?: string; series?: CalendarEvent['series'] } = {}): CalendarEvent {
  return { id: date, title: 'e', category: 'ovrigt', allDay: true, startDate: date, endDate: date, ...extra };
}

describe('headerDate', () => {
  test('skriver veckodag med stor bokstav, dag och månad', () => {
    expect(headerDate(wednesday)).toBe('Onsdag 28 oktober');
  });

  test('har en kort form utan punkt för mobilen', () => {
    expect(headerDate(wednesday, true)).toBe('Onsdag 28 okt');
  });

  test('räknar dagen i svensk tid', () => {
    // 23:30 UTC den 31 oktober är redan söndag 1 november i Stockholm.
    expect(headerDate(new Date('2026-10-31T23:30:00Z'))).toBe('Söndag 1 november');
  });
});

describe('countRestOfWeek', () => {
  test('räknar från idag till och med söndag', () => {
    const events = [day('2026-10-28'), day('2026-10-30'), day('2026-11-01'), day('2026-11-02')];
    expect(countRestOfWeek(events, wednesday)).toBe(3);
  });

  test('räknar bara idag på en söndag', () => {
    const sunday = new Date('2026-11-01T11:00:00Z');
    expect(countRestOfWeek([day('2026-11-01'), day('2026-11-02')], sunday)).toBe(1);
  });

  test('räknar en händelse över flera dagar som pågår', () => {
    expect(countRestOfWeek([day('2026-10-25', { endDate: '2026-10-29' })], wednesday)).toBe(1);
    expect(countRestOfWeek([day('2026-10-25', { endDate: '2026-10-27' })], wednesday)).toBe(0);
  });

  test('räknar varje tillfälle i en serie som infaller i veckan', () => {
    const onDay = (date: string): EventTiming => ({ allDay: true, startDate: date, endDate: date });
    const series = day('2026-10-29', { series: { rule: 'Flera dagar', later: ['2026-10-31', '2026-11-03'].map(onDay) } });
    expect(countRestOfWeek([series], wednesday)).toBe(2);
  });

  test('räknar tidsatta händelser efter svensk tid', () => {
    const timed = (start: string, end: string): CalendarEvent => ({
      id: start,
      title: 'e',
      category: 'ovrigt',
      allDay: false,
      start: new Date(start),
      end: new Date(end),
    });
    const lateSunday = timed('2026-11-01T21:00:00Z', '2026-11-01T22:00:00Z');
    const mondayInSweden = timed('2026-11-01T23:30:00Z', '2026-11-02T00:30:00Z');
    expect(countRestOfWeek([lateSunday, mondayInSweden], wednesday)).toBe(1);
  });

  test('ger 0 när veckan är tom', () => {
    expect(countRestOfWeek([], wednesday)).toBe(0);
  });
});

describe('weekCountText', () => {
  test('skriver antalet i lång form för desktop', () => {
    expect(weekCountText(3)).toBe('3 saker händer den här veckan.');
    expect(weekCountText(1)).toBe('1 sak händer den här veckan.');
    expect(weekCountText(0)).toBe('Inget inbokat den här veckan.');
  });

  test('skriver antalet i kort form för mobilen', () => {
    expect(weekCountText(3, true)).toBe('3 saker i veckan.');
    expect(weekCountText(1, true)).toBe('1 sak i veckan.');
    expect(weekCountText(0, true)).toBe('Inget inbokat i veckan.');
  });
});
