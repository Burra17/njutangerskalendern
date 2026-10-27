import { describe, expect, test } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import { mergeSeries } from './recurringSeries';

function timed(id: string, start: string, seriesId?: string): CalendarEvent {
  const startDate = new Date(start);
  return { id, title: id, category: 'ovrigt', seriesId, allDay: false, start: startDate, end: new Date(startDate.getTime() + 60 * 60_000) };
}

describe('mergeSeries', () => {
  test('lämnar händelser utan serie orörda', () => {
    const events = [timed('fika', '2026-10-28T14:30:00Z'), timed('byfest', '2026-10-29T10:00:00Z')];
    expect(mergeSeries(events)).toEqual(events);
  });

  test.each([
    ['varje vecka', 'Varje tisdag', ['2026-10-27T14:30:00Z', '2026-11-03T14:30:00Z', '2026-11-10T14:30:00Z']],
    ['varannan vecka', 'Varannan söndag', ['2026-11-01T12:00:00Z', '2026-11-15T12:00:00Z', '2026-11-29T12:00:00Z']],
    ['oregelbundet', 'Återkommer', ['2026-10-27T14:30:00Z', '2026-11-03T14:30:00Z', '2026-11-05T14:30:00Z']],
    ['varje dag', 'Återkommer', ['2026-10-27T06:00:00Z', '2026-10-28T06:00:00Z']],
  ])('en serie som återkommer %s får regeln "%s"', (_name, rule, starts) => {
    const merged = mergeSeries(starts.map((start, index) => timed(`s_${index}`, start, 's')));
    expect(merged[0].series?.rule).toBe(rule);
  });

  test('en serie med bara ett tillfälle visas som en vanlig händelse', () => {
    const [only] = mergeSeries([timed('gympa_1', '2026-10-27T14:30:00Z', 'gympa')]);
    expect(only.series).toBeUndefined();
  });

  test('TEST Gympa från den riktiga kalendern blir ett kort, även över bytet till sommartid', () => {
    // Tisdagar 15:30 svensk tid. Från 30 mars är det sommartid, och tiden i UTC flyttas en timme.
    const tuesdays = ['2027-03-16T14:30:00Z', '2027-03-23T14:30:00Z', '2027-03-30T13:30:00Z', '2027-04-06T13:30:00Z'];
    const merged = mergeSeries(tuesdays.map((start) => timed(`1ts3cf32lkgt360t01cojokor0_${start}`, start, '1ts3cf32lkgt360t01cojokor0')));

    expect(merged).toHaveLength(1);
    expect(merged[0].series).toMatchObject({ rule: 'Varje tisdag' });
    expect(merged[0].series?.later).toHaveLength(3);
  });

  test('räknar veckodagen i svensk tid', () => {
    // Måndag 23:30 i UTC är tisdag 00:30 i Stockholm.
    const merged = mergeSeries([timed('a', '2026-11-02T23:30:00Z', 's'), timed('b', '2026-11-09T23:30:00Z', 's')]);
    expect(merged[0].series?.rule).toBe('Varje tisdag');
  });

  test('slår ihop en serie till sitt första tillfälle, på dess plats i ordningen', () => {
    const merged = mergeSeries([
      timed('gympa_1', '2026-10-27T14:30:00Z', 'gympa'),
      timed('fika', '2026-10-28T14:30:00Z'),
      timed('gympa_2', '2026-11-03T14:30:00Z', 'gympa'),
      timed('gympa_3', '2026-11-10T14:30:00Z', 'gympa'),
    ]);

    expect(merged.map((event) => event.id)).toEqual(['gympa_1', 'fika']);
    expect(merged[0].series?.later).toEqual([
      expect.objectContaining({ start: new Date('2026-11-03T14:30:00Z') }),
      expect.objectContaining({ start: new Date('2026-11-10T14:30:00Z') }),
    ]);
  });
});
