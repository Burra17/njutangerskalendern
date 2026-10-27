import { describe, expect, test } from 'vitest';
import type { GoogleCalendarEvent } from '../types/calendar';
import { toCalendarEvent } from './eventMapper';
import { createMockEvents } from './mockEvents';

describe('mockdatan genom hela omvandlingen', () => {
  const events = createMockEvents(new Date('2026-06-19T08:00:00Z')).map(toCalendarEvent);
  const byId = (id: string) => events.find((event) => event.id === id)!;

  test('alla tretton händelser går igenom', () => {
    expect(events).toHaveLength(13);
  });

  test('HTML-beskrivningen blir läsbar text', () => {
    expect(byId('mock-2').description).toBe(
      'Dagordning:\n1. Ekonomi\n2. Byfesten\n\nHela dagordningen (https://example.com/dagordning) & förra protokollet finns på nätet.',
    );
    expect(byId('mock-9').description).toBe('Ungefär 8 km i lugnt tempo.\nTa med matsäck.');
  });

  test('arrangören hamnar i sitt eget fält', () => {
    expect(byId('mock-3')).toMatchObject({ organizer: 'Badplatsgruppen', description: 'Ta med kratta och arbetshandskar. Korv bjuds på efteråt.' });
  });

  test.each([
    ['mock-1', 'fika', 'Fikagruppen'],
    ['mock-2', 'moten', undefined],
    ['mock-3', 'natur', 'Badplatsgruppen'],
    ['mock-4', 'loppis', undefined],
    ['mock-5', 'idrott', undefined],
    ['mock-6', 'idrott', undefined],
    ['mock-7', 'moten', undefined],
    ['mock-8', 'fika', undefined],
    ['mock-9', 'natur', undefined],
    ['mock-10', 'ovrigt', undefined],
    ['mock-11', 'loppis', 'Auktionsgruppen'],
    ['mock-12', 'moten', undefined],
    ['mock-13', 'loppis', undefined],
  ])('%s får kategorin %s och arrangören %s', (id, category, organizer) => {
    expect(byId(id)).toMatchObject({ category, organizer });
  });

  test('byfesten pågår i tre dagar', () => {
    expect(byId('mock-8')).toMatchObject({ allDay: true, startDate: '2026-07-16', endDate: '2026-07-18' });
  });

  test('planeringsmötet saknar plats', () => {
    expect(byId('mock-12').location).toBeUndefined();
  });
});

const base: GoogleCalendarEvent = {
  id: 'e1',
  summary: 'Fika i bygdegården',
  start: { dateTime: '2026-06-19T15:00:00+02:00', timeZone: 'Europe/Stockholm' },
  end: { dateTime: '2026-06-19T16:30:00+02:00', timeZone: 'Europe/Stockholm' },
};

describe('toCalendarEvent', () => {
  test('en tidsatt händelse får start och slut som tidpunkter', () => {
    expect(toCalendarEvent(base)).toMatchObject({
      id: 'e1',
      title: 'Fika i bygdegården',
      allDay: false,
      start: new Date('2026-06-19T13:00:00Z'),
      end: new Date('2026-06-19T14:30:00Z'),
    });
  });

  test('trimmar texterna och räknar tomma som saknade', () => {
    const event = toCalendarEvent({ ...base, summary: '  Fika  ', description: ' \n ', location: ' Bygdegården ' });
    expect(event.title).toBe('Fika');
    expect(event.description).toBeUndefined();
    expect(event.location).toBe('Bygdegården');
    expect(toCalendarEvent({ ...base, location: '' }).location).toBeUndefined();
  });

  test('gör beskrivningen till ren text och plockar ut arrangören', () => {
    const event = toCalendarEvent({ ...base, description: 'Kaffe &amp; bullar.<br>Arrangör: Fikagruppen' });
    expect(event.description).toBe('Kaffe & bullar.');
    expect(event.organizer).toBe('Fikagruppen');
  });

  test('letar kategorin i beskrivningen när titeln inte säger något, men inte i arrangören', () => {
    expect(toCalendarEvent({ ...base, summary: 'Söndagsträff', description: 'Vi bjuder på fika.' }).category).toBe('fika');
    expect(toCalendarEvent({ ...base, summary: 'Bokcirkel', description: 'Månadens bok.\nArrangör: Fikagruppen' }).category).toBe('ovrigt');
    expect(toCalendarEvent({ ...base, summary: undefined, description: 'Loppis i garaget' }).category).toBe('loppis');
  });

  test('en händelse utan titel heter Händelse', () => {
    expect(toCalendarEvent({ ...base, summary: undefined }).title).toBe('Händelse');
    expect(toCalendarEvent({ ...base, summary: '   ' }).title).toBe('Händelse');
  });

  test('en heldag börjar och slutar samma dag, trots Googles exklusiva slutdatum', () => {
    const event = toCalendarEvent({ ...base, start: { date: '2026-06-19' }, end: { date: '2026-06-20' } });
    expect(event).toMatchObject({ allDay: true, startDate: '2026-06-19', endDate: '2026-06-19' });
  });

  test('en heldag över flera dagar slutar på sista dagen', () => {
    const event = toCalendarEvent({ ...base, start: { date: '2026-06-19' }, end: { date: '2026-06-22' } });
    expect(event).toMatchObject({ allDay: true, startDate: '2026-06-19', endDate: '2026-06-21' });
  });

  test('en heldag över ett månadsskifte slutar på rätt dag', () => {
    const event = toCalendarEvent({ ...base, start: { date: '2026-06-30' }, end: { date: '2026-07-02' } });
    expect(event).toMatchObject({ allDay: true, startDate: '2026-06-30', endDate: '2026-07-01' });
  });
});
