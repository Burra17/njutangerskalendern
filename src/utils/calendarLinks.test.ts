import { describe, expect, test } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import { calendarTarget, eventNotes, googleCalendarUrl, icsFile, icsFileName, mapsUrl } from './calendarLinks';

const now = new Date('2026-10-27T11:00:00Z');

const meeting: CalendarEvent = {
  id: 'mote',
  title: 'Styrelsemöte i bygdegården',
  category: 'moten',
  description: 'Dagordning:\n1. Ekonomi; budget, kassa',
  location: 'Bygdegården, Njutångersvägen 12, 825 96 Njutånger',
  organizer: 'Byalaget',
  allDay: false,
  start: new Date('2026-10-29T17:00:00Z'),
  end: new Date('2026-10-29T19:00:00Z'),
};

const cleanup: CalendarEvent = {
  id: 'stad',
  title: 'Städdag',
  category: 'ovrigt',
  allDay: true,
  startDate: '2026-10-31',
  endDate: '2026-10-31',
};

const festival: CalendarEvent = { ...cleanup, id: 'fest', title: 'Byfest', startDate: '2027-06-18', endDate: '2027-06-20' };

function lines(event: CalendarEvent): string[] {
  return icsFile(event, now).split('\r\n');
}

describe('eventNotes', () => {
  test('lägger beskrivning, arrangör och sajtens adress i den ordningen', () => {
    expect(eventNotes(meeting)).toBe('Dagordning:\n1. Ekonomi; budget, kassa\n\nArrangör: Byalaget\n\nhttps://njutangerskalendern.vercel.app');
  });

  test('har bara adressen när beskrivning och arrangör saknas', () => {
    expect(eventNotes(cleanup)).toBe('https://njutangerskalendern.vercel.app');
  });
});

describe('googleCalendarUrl', () => {
  test('har titel, UTC-tider, plats och anteckning', () => {
    const url = new URL(googleCalendarUrl(meeting));
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Styrelsemöte i bygdegården');
    expect(url.searchParams.get('dates')).toBe('20261029T170000Z/20261029T190000Z');
    expect(url.searchParams.get('location')).toBe('Bygdegården, Njutångersvägen 12, 825 96 Njutånger');
    expect(url.searchParams.get('details')).toBe(eventNotes(meeting));
  });

  test('ger heldagar ett exklusivt slutdatum och ingen plats när den saknas', () => {
    expect(new URL(googleCalendarUrl(cleanup)).searchParams.get('dates')).toBe('20261031/20261101');
    expect(new URL(googleCalendarUrl(festival)).searchParams.get('dates')).toBe('20270618/20270621');
    expect(new URL(googleCalendarUrl(cleanup)).searchParams.has('location')).toBe(false);
  });
});

describe('icsFile', () => {
  test('har en händelse med UTC-tider, ett fast UID och CRLF', () => {
    const file = icsFile(meeting, now);
    expect(file.endsWith('\r\n')).toBe(true);
    expect(lines(meeting)).toEqual(
      expect.arrayContaining([
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:mote@njutangerskalendern',
        'DTSTAMP:20261027T110000Z',
        'DTSTART:20261029T170000Z',
        'DTEND:20261029T190000Z',
        'SUMMARY:Styrelsemöte i bygdegården',
        'END:VEVENT',
        'END:VCALENDAR',
      ]),
    );
  });

  test('skriver heldagar och flerdagars som datum med exklusivt slut', () => {
    expect(lines(cleanup)).toEqual(expect.arrayContaining(['DTSTART;VALUE=DATE:20261031', 'DTEND;VALUE=DATE:20261101']));
    expect(lines(festival)).toEqual(expect.arrayContaining(['DTSTART;VALUE=DATE:20270618', 'DTEND;VALUE=DATE:20270621']));
    expect(icsFile(cleanup, now)).not.toContain('LOCATION');
  });

  test('skyddar komma, semikolon och radbrytningar, och viker rader över 75 byte utan att dela å, ä och ö', () => {
    const unfolded = icsFile(meeting, now).replaceAll('\r\n ', '');
    expect(unfolded).toContain('LOCATION:Bygdegården\\, Njutångersvägen 12\\, 825 96 Njutånger');
    expect(unfolded).toContain('DESCRIPTION:Dagordning:\\n1. Ekonomi\\; budget\\, kassa\\n\\nArrangör: Byalaget\\n\\n');

    const encoder = new TextEncoder();
    for (const line of lines(meeting)) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
      expect(line).not.toContain('�');
    }
  });
});

describe('icsFileName', () => {
  test('gör titeln till ett filnamn utan å, ä, ö och emojis', () => {
    expect(icsFileName('🏷️ Loppis i Bygdegården')).toBe('loppis-i-bygdegarden.ics');
    expect(icsFileName('Städdag & grillkväll!')).toBe('staddag-grillkvall.ics');
  });

  test('kortar långa titlar och klarar en titel utan bokstäver', () => {
    const name = icsFileName('Årsmöte för vägföreningen med genomgång av budget och val av styrelse');
    expect(name.length).toBeLessThanOrEqual(54);
    expect(name).not.toMatch(/-\.ics$/);
    expect(icsFileName('🎉')).toBe('handelse.ics');
  });
});

describe('mapsUrl', () => {
  test('lägger till byns namn när platsen bara är ett namn', () => {
    expect(mapsUrl('Bygdegården')).toBe('https://www.google.com/maps/search/?api=1&query=Bygdeg%C3%A5rden%2C%20Njut%C3%A5nger');
  });

  test('använder en adress som den står', () => {
    expect(new URL(mapsUrl('Skolan, Njutångersvägen 3')).searchParams.get('query')).toBe('Skolan, Njutångersvägen 3');
  });
});

describe('calendarTarget', () => {
  test('ger .ics till Safari på iPhone och iPad och till Mac', () => {
    expect(calendarTarget('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1')).toBe(
      'ics',
    );
    expect(calendarTarget('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15')).toBe('ics');
  });

  test('ger Google till Chrome, Firefox och Edge på iPhone och iPad', () => {
    expect(calendarTarget('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0 Mobile/15E148')).toBe(
      'googleOnIos',
    );
    expect(calendarTarget('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 CriOS/130.0 Mobile/15E148')).toBe('googleOnIos');
    expect(calendarTarget('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 FxiOS/133.0 Mobile/15E148')).toBe(
      'googleOnIos',
    );
    expect(calendarTarget('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 EdgiOS/130.0 Mobile/15E148')).toBe(
      'googleOnIos',
    );
  });

  test('ger Google till Android och Windows', () => {
    expect(calendarTarget('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36')).toBe('google');
    expect(calendarTarget('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36')).toBe('google');
  });
});
