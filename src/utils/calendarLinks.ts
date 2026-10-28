import { villageConfig } from '../config/villageConfig';
import type { CalendarEvent, IsoDate } from '../types/calendar';
import { addDays } from './dates';

// Googles mall öppnar Google Kalender i appen eller på webben med händelsen ifylld.
export function googleCalendarUrl(event: CalendarEvent): string {
  const [start, end] = compactTimes(event);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates: `${start}/${end}`, details: eventNotes(event) });
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function icsFile(event: CalendarEvent, now: Date): string {
  const [start, end] = compactTimes(event);
  const dateType = event.allDay ? ';VALUE=DATE' : '';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${villageConfig.siteName}//SV`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // Samma UID varje gång, så att kalenderappen uppdaterar händelsen i stället för att lägga till en dubblett.
    `UID:${event.id}@njutangerskalendern`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART${dateType}:${start}`,
    `DTEND${dateType}:${end}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(eventNotes(event))}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

// Titeln som filnamn, till exempel 'loppis-i-bygdegarden.ics'. NFD delar å, ä och ö i bokstav och prickar, och prickarna tas bort.
export function icsFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '')
    .slice(0, 50)
    .replace(/-$/, '');
  return `${slug || 'handelse'}.ics`;
}

// En plats utan komma är oftast bara ett namn, som "Bygdegården", och byns namn gör att kartan hittar rätt.
export function mapsUrl(location: string): string {
  const query = location.includes(',') ? location : `${location}, ${villageConfig.villageName}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// ics: Safari och Mac. googleOnIos: andra webbläsare på iPhone och iPad, som bara öppnar en .ics som hämtas från en server (testat i #16).
export type CalendarTarget = 'ics' | 'googleOnIos' | 'google';

// iPadOS säger Macintosh, så den räknas också. Chrome, Firefox och Edge på iOS säger CriOS, FxiOS och EdgiOS.
export function calendarTarget(userAgent: string): CalendarTarget {
  if (!/iPhone|iPad|iPod|Macintosh/.test(userAgent)) return 'google';
  return /CriOS|FxiOS|EdgiOS/.test(userAgent) ? 'googleOnIos' : 'ics';
}

// Anteckningen i kalendern. Arrangören är redan borttagen ur beskrivningen och läggs tillbaka här.
export function eventNotes(event: CalendarEvent): string {
  return [event.description, event.organizer && `Arrangör: ${event.organizer}`, villageConfig.siteUrl].filter(Boolean).join('\n\n');
}

// Tidsatta händelser i UTC, så att filen inte behöver någon tidszon. Heldagar har ett exklusivt slutdatum, som hos Google.
function compactTimes(event: CalendarEvent): [string, string] {
  if (event.allDay) return [compactDate(event.startDate), compactDate(addDays(event.endDate, 1))];
  return [utcStamp(event.start), utcStamp(event.end)];
}

function compactDate(date: IsoDate): string {
  return date.replaceAll('-', '');
}

// Till exempel '20261029T140000Z'.
function utcStamp(instant: Date): string {
  return instant
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeText(text: string): string {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r\n|\r|\n/g, '\\n');
}

// En rad i .ics får vara högst 75 byte. Längre rader fortsätter på nästa rad efter ett mellanslag, som räknas in.
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      parts.push(current);
      current = ' ';
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n');
}
