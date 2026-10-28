// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import EventCard from './EventCard';

// Tisdag 27 oktober 2026 kl. 12:00 i Stockholm.
const now = new Date('2026-10-27T11:00:00Z');

const meeting: CalendarEvent = {
  id: 'mote',
  title: 'TEST Styrelsemöte',
  category: 'moten',
  description: 'Dagordning:\n• Ekonomi\nRing 070-174 06 05 eller se https://example.com/protokoll',
  location: 'Bygdegården, Njutångersvägen 12, 825 96 Njutånger',
  organizer: 'Byalaget',
  allDay: false,
  start: new Date('2026-10-29T14:00:00Z'),
  end: new Date('2026-10-29T15:00:00Z'),
};

const gympa: CalendarEvent = {
  id: 'gympa',
  title: 'TEST Gympa',
  category: 'idrott',
  allDay: false,
  start: new Date('2026-10-27T14:30:00Z'),
  end: new Date('2026-10-27T15:30:00Z'),
  series: {
    rule: 'Varje tisdag',
    later: ['2026-11-03', '2026-11-10', '2026-11-17', '2026-11-24'].map((day) => ({
      allDay: false as const,
      start: new Date(`${day}T14:30:00Z`),
      end: new Date(`${day}T15:30:00Z`),
    })),
  },
};

function renderCard(event: CalendarEvent) {
  render(
    <ul>
      <EventCard event={event} now={now} />
    </ul>,
  );
  return screen.getByRole('button', { name: event.title });
}

// jsdom har ingen createObjectURL, och kortet gör en Blob av .ics-filen.
beforeEach(() => {
  URL.createObjectURL = () => 'blob:test';
  URL.revokeObjectURL = () => {};
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('EventCard', () => {
  test('visar det viktigaste hopfällt', () => {
    const button = renderCard(meeting);

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(within(button).getByText('tors')).toBeTruthy();
    expect(within(button).getByText('29')).toBeTruthy();
    expect(within(button).getByText('Möten & Beslut')).toBeTruthy();
    expect(within(button).getByText('15:00–16:00')).toBeTruthy();
    expect(within(button).getByText('Bygdegården')).toBeTruthy();
    expect(within(button).getByText('Dagordning:')).toBeTruthy();
    expect(screen.queryByText('Arrangör:', { exact: false })).toBeNull();
  });

  test('fälls ut och ihop, och visar då allt med klickbara länkar', () => {
    const button = renderCard(meeting);
    fireEvent.click(button);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Bygdegården, Njutångersvägen 12, 825 96 Njutånger')).toBeTruthy();
    expect(screen.getByText('Byalaget')).toBeTruthy();
    expect(screen.getByRole('link', { name: '070-174 06 05' }).getAttribute('href')).toBe('tel:0701740605');
    expect(screen.getByRole('link', { name: 'https://example.com/protokoll' }).getAttribute('href')).toBe('https://example.com/protokoll');

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Byalaget')).toBeNull();
  });

  test('visar idag, serieregeln och de följande tillfällena', () => {
    const button = renderCard(gympa);
    expect(within(button).getByText('Idag')).toBeTruthy();
    expect(within(button).getByText('Varje tisdag')).toBeTruthy();

    fireEvent.click(button);
    expect(screen.getByText('Även 3 nov, 10 nov och 17 nov.')).toBeTruthy();
  });

  test('skärmläsare får titeln som knappens namn och tid och plats som beskrivning', () => {
    const button = renderCard(meeting);
    expect(button.getAttribute('aria-describedby')).toBeTruthy();
    const description = document.getElementById(button.getAttribute('aria-describedby')!);
    expect(description?.textContent).toContain('15:00–16:00');
  });

  test('visar HTML i texten som text, aldrig som HTML', () => {
    const { container } = render(
      <ul>
        <EventCard event={{ ...meeting, description: '<b>fet</b> <img src=x onerror=alert(1)>' }} now={now} />
      </ul>,
    );
    fireEvent.click(screen.getByRole('button'));

    expect(container.querySelector('b, img')).toBeNull();
    expect(screen.getAllByText('<b>fet</b> <img src=x onerror=alert(1)>', { exact: false }).length).toBeGreaterThan(0);
  });

  test('ger kalenderknappen Googles mall och filen som reserv utanför Apple, och kartan när platsen finns', () => {
    fireEvent.click(renderCard(meeting));

    expect(screen.getByRole('link', { name: 'Lägg till i kalendern' }).getAttribute('href')).toMatch(/^https:\/\/calendar\.google\.com\//);
    const file = screen.getByRole('link', { name: 'Annan kalender? Ladda ner fil' });
    expect(file.getAttribute('href')).toBe('blob:test');
    expect(file.getAttribute('download')).toBe('test-styrelsemote.ics');
    expect(screen.getByRole('link', { name: 'Visa på karta' }).getAttribute('href')).toMatch(/^https:\/\/www\.google\.com\/maps\//);
  });

  test('ger filen först i Safari på iPhone, och visar ingen karta utan plats', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1',
    );
    fireEvent.click(renderCard(gympa));

    const file = screen.getByRole('link', { name: 'Lägg till i kalendern' });
    expect(file.getAttribute('href')).toBe('blob:test');
    expect(file.getAttribute('download')).toBe('test-gympa.ics');
    expect(screen.getByRole('link', { name: 'Använder du Google Kalender?' }).getAttribute('href')).toMatch(/^https:\/\/calendar\.google\.com\//);
    expect(screen.queryByRole('link', { name: 'Visa på karta' })).toBeNull();
  });

  test('ger Googles mall och ett tips om Safari i Google-appen på iPhone', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) GSA/340.0 Mobile/15E148 Safari/604.1',
    );
    fireEvent.click(renderCard(gympa));

    expect(screen.getByRole('link', { name: 'Lägg till i kalendern' }).getAttribute('href')).toMatch(/^https:\/\/calendar\.google\.com\//);
    expect(screen.getByText('Vill du ha den i iPhones kalender? Öppna sidan i Safari.')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Annan kalender? Ladda ner fil' })).toBeNull();
  });

  test('flyttar kategoriemojin från titeln till etiketten', () => {
    render(
      <ul>
        <EventCard event={{ ...meeting, title: '📋 Styrelsemöte', categoryEmoji: '📋' }} now={now} />
      </ul>,
    );
    const button = screen.getByRole('button', { name: 'Styrelsemöte' });
    expect(within(button).getByText('Möten & Beslut', { exact: false }).textContent).toBe('📋 Möten & Beslut');
  });

  test('ger etiketten kategorins egen emoji när titeln inte har någon', () => {
    const button = renderCard(meeting);
    expect(within(button).getByText('Möten & Beslut', { exact: false }).textContent).toBe('📋 Möten & Beslut');
  });
});
