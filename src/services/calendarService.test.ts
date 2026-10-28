import { describe, expect, test, vi } from 'vitest';
import type { GoogleCalendarEvent } from '../types/calendar';
import { loadEvents } from './calendarService';

const settings = { apiKey: 'nyckel', calendarId: 'abc@group.calendar.google.com' };
const now = new Date('2026-06-19T08:00:00Z');

const fika: GoogleCalendarEvent = {
  id: 'e1',
  summary: '☕ Fika',
  start: { dateTime: '2026-06-19T15:00:00+02:00' },
  end: { dateTime: '2026-06-19T16:00:00+02:00' },
};

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value), data };
}

function fakeFetch(items: GoogleCalendarEvent[], status = 200) {
  return vi.fn(async (_url: string) => new Response(JSON.stringify({ items }), { status }));
}

describe('loadEvents', () => {
  test('frågar Google efter dagens och ungefär ett halvårs händelser', async () => {
    const fetch = fakeFetch([fika]);
    await loadEvents(settings, { fetch, storage: fakeStorage(), now });

    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://www.googleapis.com/calendar/v3/calendars/abc%40group.calendar.google.com/events');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      key: 'nyckel',
      timeMin: '2026-06-19T00:00:00+02:00',
      timeMax: '2026-12-19T00:00:00+01:00',
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
      fields: 'items(id,recurringEventId,summary,description,location,start,end)',
    });
  });

  test('börjar vid midnatt även den dag klockan ställs om', async () => {
    const fetch = fakeFetch([]);
    await loadEvents(settings, { fetch, storage: fakeStorage(), now: new Date('2026-03-29T10:00:00Z') });
    expect(new URL(fetch.mock.calls[0][0]).searchParams.get('timeMin')).toBe('2026-03-29T00:00:00+01:00');
  });

  test('ger händelserna omvandlade', async () => {
    const events = await loadEvents(settings, { fetch: fakeFetch([fika]), storage: fakeStorage(), now });
    expect(events).toEqual([expect.objectContaining({ id: 'e1', title: '☕ Fika', category: 'gemenskap', allDay: false })]);
  });

  test('sparar svaret och frågar inte Google igen inom tio minuter', async () => {
    const storage = fakeStorage();
    const fetch = fakeFetch([fika]);
    await loadEvents(settings, { fetch, storage, now });
    const events = await loadEvents(settings, { fetch, storage, now: new Date(now.getTime() + 9 * 60_000) });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(events).toEqual([expect.objectContaining({ id: 'e1' })]);
  });

  test('frågar Google igen när cachen är äldre än tio minuter', async () => {
    const storage = fakeStorage();
    const fetch = fakeFetch([fika]);
    await loadEvents(settings, { fetch, storage, now });
    await loadEvents(settings, { fetch, storage, now: new Date(now.getTime() + 11 * 60_000) });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test.each([
    ['trasig JSON', '{inte json'],
    ['fel form', JSON.stringify({ hej: 1 })],
    ['sparad i framtiden', JSON.stringify({ savedAt: now.getTime() + 60 * 60_000, items: [] })],
  ])('ignorerar en cache med %s', async (_name, raw) => {
    const fetch = fakeFetch([fika]);
    const events = await loadEvents(settings, {
      fetch,
      storage: fakeStorage({ 'njutangerskalendern:events:v2:abc@group.calendar.google.com': raw }),
      now,
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(events).toHaveLength(1);
  });

  test('använder inte en cache från en äldre version, som saknar fält som hämtas nu', async () => {
    const fetch = fakeFetch([fika]);
    const old = JSON.stringify({ savedAt: now.getTime(), items: [] });
    await loadEvents(settings, { fetch, storage: fakeStorage({ 'njutangerskalendern:events:abc@group.calendar.google.com': old }), now });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('använder inte en annan kalenders cache', async () => {
    const storage = fakeStorage();
    await loadEvents(settings, { fetch: fakeFetch([fika]), storage, now });
    const fetch = fakeFetch([]);
    await loadEvents({ ...settings, calendarId: 'annan@group.calendar.google.com' }, { fetch, storage, now });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('fungerar när lagringen inte går att skriva till', async () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    await expect(loadEvents(settings, { fetch: fakeFetch([fika]), storage, now })).resolves.toHaveLength(1);
  });

  test('hoppar över en händelse som inte går att omvandla', async () => {
    const broken = { ...fika, id: 'trasig', end: { date: '2026-06-20' } };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const events = await loadEvents(settings, { fetch: fakeFetch([broken, fika]), storage: fakeStorage(), now });

    expect(events.map((event) => event.id)).toEqual(['e1']);
    expect(console.warn).toHaveBeenCalled();
  });

  test('ger ett fel när Google svarar med ett fel', async () => {
    await expect(loadEvents(settings, { fetch: fakeFetch([], 403), storage: fakeStorage(), now })).rejects.toThrow('403');
  });
});
