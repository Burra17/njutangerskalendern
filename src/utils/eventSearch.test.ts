import { describe, expect, test } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import { searchEvents } from './eventSearch';

const timing = { allDay: true as const, startDate: '2026-11-07', endDate: '2026-11-07' };

const loppis: CalendarEvent = {
  id: 'loppis',
  title: 'Loppis',
  category: 'loppis',
  location: 'Bygdegården, Njutångersvägen 12',
  description: 'Fynda bland grannarnas prylar.',
  organizer: 'Hembygdsföreningen',
  ...timing,
};
const gympa: CalendarEvent = { id: 'gympa', title: 'Gympa för seniorer', category: 'idrott', ...timing };
const mote: CalendarEvent = { id: 'mote', title: 'Årsmöte', category: 'moten', location: 'Skolan', ...timing };
const all = [loppis, gympa, mote];

function ids(query: string) {
  return searchEvents(all, query).map((event) => event.id);
}

describe('searchEvents', () => {
  test('en tom sökning visar allt', () => {
    expect(ids('')).toEqual(['loppis', 'gympa', 'mote']);
    expect(ids('   ')).toEqual(['loppis', 'gympa', 'mote']);
  });

  test('letar i titel, beskrivning, plats och arrangör', () => {
    expect(ids('gympa')).toEqual(['gympa']);
    expect(ids('prylar')).toEqual(['loppis']);
    expect(ids('skolan')).toEqual(['mote']);
    expect(ids('hembygd')).toEqual(['loppis']);
  });

  test('letar i kategorins namn', () => {
    expect(ids('idrott')).toEqual(['gympa']);
    expect(ids('marknad')).toEqual(['loppis']);
  });

  test('bryr sig inte om versaler', () => {
    expect(ids('LOPPIS')).toEqual(['loppis']);
    expect(ids('årsMÖTE')).toEqual(['mote']);
  });

  test('varje ord måste finnas, men inte i följd eller i samma fält', () => {
    expect(ids('loppis bygdegården')).toEqual(['loppis']);
    expect(ids('bygdegården  loppis')).toEqual(['loppis']);
    expect(ids('loppis skolan')).toEqual([]);
  });

  test('å, ä och ö är egna bokstäver', () => {
    expect(ids('arsmote')).toEqual([]);
    expect(ids('årsmöte')).toEqual(['mote']);
  });

  test('ö skrivet som o plus prickar hittar ändå', () => {
    expect(ids('a\u030Arsmo\u0308te')).toEqual(['mote']);
  });

  test('behåller ordningen', () => {
    expect(ids('e')).toEqual(['loppis', 'gympa', 'mote']);
  });
});
