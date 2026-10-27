import { describe, expect, test } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import { groupByMonth } from './monthGroups';

function timed(id: string, start: string): CalendarEvent {
  const startDate = new Date(start);
  return { id, title: id, category: 'ovrigt', allDay: false, start: startDate, end: new Date(startDate.getTime() + 60 * 60_000) };
}

function allDay(id: string, startDate: string, endDate: string): CalendarEvent {
  return { id, title: id, category: 'ovrigt', allDay: true, startDate, endDate };
}

describe('groupByMonth', () => {
  test('grupperar händelserna per månad i ordning, med rubriker med stor bokstav', () => {
    const groups = groupByMonth([
      timed('fika', '2026-10-28T14:30:00Z'),
      timed('möte', '2026-11-05T14:00:00Z'),
      timed('loppis', '2026-11-12T09:00:00Z'),
    ]);

    expect(groups.map((group) => [group.title, group.events.map((event) => event.id)])).toEqual([
      ['Oktober 2026', ['fika']],
      ['November 2026', ['möte', 'loppis']],
    ]);
  });

  test('en händelse över flera dagar hamnar under månaden den börjar', () => {
    const [group] = groupByMonth([allDay('byfest', '2026-10-30', '2026-11-01')]);
    expect(group.title).toBe('Oktober 2026');
  });

  test('räknar månaden i svensk tid', () => {
    // 31 oktober 23:30 i UTC är redan 1 november i Stockholm.
    const [group] = groupByMonth([timed('nattbad', '2026-10-31T23:30:00Z')]);
    expect(group.title).toBe('November 2026');
  });

  test('ger inga grupper för en tom lista', () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
