import { describe, expect, test } from 'vitest';
import type { CalendarEvent, EventTiming } from '../types/calendar';
import { alsoOn, cardTitle, dateBadge, shortPlace, timeRange } from './eventFormat';

function timed(start: string, end: string): CalendarEvent {
  return { id: 'e', title: 'e', category: 'ovrigt', allDay: false, start: new Date(start), end: new Date(end) };
}

function allDay(startDate: string, endDate: string): CalendarEvent {
  return { id: 'e', title: 'e', category: 'ovrigt', allDay: true, startDate, endDate };
}

// Tisdag 27 oktober 2026 kl. 12:00 i Stockholm.
const now = new Date('2026-10-27T11:00:00Z');

describe('dateBadge', () => {
  test('visar veckodag och datum för en vanlig dag', () => {
    expect(dateBadge(timed('2026-10-29T14:30:00Z', '2026-10-29T15:30:00Z'), now)).toEqual({ label: 'tors', day: 29, level: 'normal' });
    expect(dateBadge(timed('2026-11-01T12:00:00Z', '2026-11-01T13:00:00Z'), now)).toEqual({ label: 'sön', day: 1, level: 'normal' });
  });

  test('visar Idag och Imorgon, där Idag väger tyngst', () => {
    expect(dateBadge(timed('2026-10-27T14:30:00Z', '2026-10-27T15:30:00Z'), now)).toEqual({ label: 'Idag', day: 27, level: 'strong' });
    expect(dateBadge(timed('2026-10-28T14:30:00Z', '2026-10-28T15:30:00Z'), now)).toEqual({ label: 'Imorgon', day: 28, level: 'soft' });
    expect(dateBadge(allDay('2026-10-27', '2026-10-27'), now)).toMatchObject({ label: 'Idag' });
  });

  test('visar Pågår för en händelse som pågår just nu, före Idag', () => {
    expect(dateBadge(timed('2026-10-27T10:00:00Z', '2026-10-27T13:00:00Z'), now)).toEqual({ label: 'Pågår', day: 27, level: 'strong' });
  });

  test('visar Pågår för en händelse över flera dagar som började tidigare', () => {
    expect(dateBadge(allDay('2026-10-25', '2026-10-28'), now)).toEqual({ label: 'Pågår', day: 25, level: 'strong' });
  });

  test('räknar dagen i svensk tid', () => {
    // 22:30 UTC den 27 oktober är 23:30 i Stockholm, alltså fortfarande idag.
    expect(dateBadge(timed('2026-10-27T22:30:00Z', '2026-10-27T23:00:00Z'), now)).toMatchObject({ label: 'Idag' });
  });
});

describe('timeRange', () => {
  test('skriver start och slut för en händelse samma dag', () => {
    expect(timeRange(timed('2026-10-28T14:30:00Z', '2026-10-28T15:30:00Z'))).toBe('15:30–16:30');
  });

  test('skriver bara tiden när en kväll slutar före kl. 06 nästa dag', () => {
    expect(timeRange(timed('2026-06-19T16:00:00Z', '2026-06-20T00:00:00Z'))).toBe('18:00–02:00');
  });

  test('skriver datum och tid när händelsen pågår längre än över natten, med svenska kortformer som juni', () => {
    expect(timeRange(timed('2026-06-19T16:00:00Z', '2026-06-21T13:00:00Z'))).toBe('19 juni 18:00–21 juni 15:00');
  });

  test('skriver Heldag och datumintervall för heldagar', () => {
    expect(timeRange(allDay('2026-10-27', '2026-10-27'))).toBe('Heldag');
    expect(timeRange(allDay('2026-10-29', '2026-10-31'))).toBe('29–31 okt');
    expect(timeRange(allDay('2026-10-30', '2026-11-02'))).toBe('30 okt–2 nov');
  });
});

describe('shortPlace', () => {
  test('tar texten fram till första kommatecknet', () => {
    expect(shortPlace('Bygdegården, Njutångersvägen 12, 825 96 Njutånger')).toBe('Bygdegården');
    expect(shortPlace('Skolan')).toBe('Skolan');
  });
});

describe('alsoOn', () => {
  const tuesday = (date: string): EventTiming => ({ allDay: false, start: new Date(`${date}T14:30:00Z`), end: new Date(`${date}T15:30:00Z`) });

  test('räknar upp högst tre följande tillfällen', () => {
    expect(alsoOn([tuesday('2026-11-03'), tuesday('2026-11-10'), tuesday('2026-11-17'), tuesday('2026-11-24')])).toBe(
      'Även 3 nov, 10 nov och 17 nov.',
    );
  });

  test('klarar ett och två tillfällen', () => {
    expect(alsoOn([tuesday('2026-11-03')])).toBe('Även 3 nov.');
    expect(alsoOn([tuesday('2026-11-03'), { allDay: true, startDate: '2026-11-10', endDate: '2026-11-10' }])).toBe('Även 3 nov och 10 nov.');
  });
});

describe('cardTitle', () => {
  const titled = (title: string, categoryEmoji?: string): CalendarEvent => ({ ...allDay('2026-10-29', '2026-10-29'), title, categoryEmoji });

  test('tar bort emojin som avgjorde kategorin, först eller mitt i titeln', () => {
    expect(cardTitle(titled('☕ Förmiddagsfika', '☕'))).toBe('Förmiddagsfika');
    expect(cardTitle(titled('TEST ☕ Fika', '☕'))).toBe('TEST Fika');
  });

  test('låter andra emojis och titlar utan kategoriemoji stå kvar', () => {
    expect(cardTitle(titled('☕ Fika med 🎂', '☕'))).toBe('Fika med 🎂');
    expect(cardTitle(titled('Byfest 🎉 med grill'))).toBe('Byfest 🎉 med grill');
    expect(cardTitle(titled('Bokcirkel'))).toBe('Bokcirkel');
  });

  test('behåller titeln när den bara är emojin', () => {
    expect(cardTitle(titled('☕', '☕'))).toBe('☕');
  });
});
