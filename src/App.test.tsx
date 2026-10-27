// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import App from './App';
import type { CalendarEvent } from './types/calendar';

const loppis: CalendarEvent = {
  id: 'loppis',
  title: 'TEST Loppis',
  category: 'loppis',
  location: 'Bygdegården',
  allDay: true,
  startDate: '2026-10-31',
  endDate: '2026-10-31',
};
const gympa: CalendarEvent = { id: 'gympa', title: 'TEST Gympa', category: 'idrott', allDay: true, startDate: '2026-11-03', endDate: '2026-11-03' };
const fika: CalendarEvent = {
  id: 'fika',
  title: 'TEST Fika',
  category: 'fika',
  location: 'Bygdegården',
  allDay: true,
  startDate: '2026-11-07',
  endDate: '2026-11-07',
};

// Fasta händelser i stället för Google eller demoläget, så att testet inte beror på .env eller dagens datum.
vi.mock('./hooks/useEvents', () => ({
  useEvents: () => ({ events: [loppis, gympa, fika], isLoading: false, error: null, isDemo: false, retry: () => {} }),
}));

function search(text: string) {
  fireEvent.change(screen.getByRole('searchbox', { name: 'Sök händelser' }), { target: { value: text } });
}

function months() {
  return screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
}

afterEach(cleanup);

describe('sökningen', () => {
  test('filtrerar tidslinjen direkt, och månader utan träffar försvinner', () => {
    render(<App />);
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);

    search('idrott');
    expect(months()).toEqual(['November 2026']);
    expect(screen.getByRole('button', { name: 'TEST Gympa' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'TEST Fika' })).toBeNull();
    expect(screen.getByText('1 händelse matchar.')).toBeTruthy();

    search('bygdegården');
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
    expect(screen.getByText('2 händelser matchar.')).toBeTruthy();
  });

  test('säger till när inget matchar, och knappen rensar sökningen', () => {
    render(<App />);
    search('kräftskiva');

    expect(screen.getByText('Inget matchar ”kräftskiva”.')).toBeTruthy();
    expect(months()).toEqual([]);

    // Både krysset och knappen i meddelandet heter Rensa sökningen. Det här är knappen med synlig text.
    fireEvent.click(screen.getByText('Rensa sökningen'));
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
  });

  test('krysset i sökfältet rensar och syns bara när det finns text', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Rensa sökningen' })).toBeNull();

    search('gympa');
    fireEvent.click(screen.getByRole('button', { name: 'Rensa sökningen' }));
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
  });
});
