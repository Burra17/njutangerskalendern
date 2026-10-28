// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
  const timeline = screen.getByRole('region', { name: 'Kommande händelser' });
  return within(timeline)
    .queryAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent);
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

    fireEvent.click(screen.getByRole('button', { name: 'Rensa sökningen' }));
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
  });

  test('krysset i sökfältet rensar och syns bara när det finns text', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Töm sökfältet' })).toBeNull();

    search('gympa');
    fireEvent.click(screen.getByRole('button', { name: 'Töm sökfältet' }));
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
  });
});

describe('kategorifiltret', () => {
  function pill(name: string) {
    return screen.getByRole('button', { name });
  }

  test('visar bara vald kategori och fungerar tillsammans med sökningen', () => {
    render(<App />);
    expect(pill('Alla').getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(pill('Fika & Gemenskap'));
    expect(pill('Fika & Gemenskap').getAttribute('aria-pressed')).toBe('true');
    expect(pill('Alla').getAttribute('aria-pressed')).toBe('false');
    expect(months()).toEqual(['November 2026']);
    expect(screen.getByText('1 händelse matchar.')).toBeTruthy();

    // Sökningen letar bara inom vald kategori, så loppisen i bygdegården syns inte.
    search('bygdegården');
    expect(screen.getByRole('button', { name: 'TEST Fika' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'TEST Loppis' })).toBeNull();

    fireEvent.click(pill('Alla'));
    expect(screen.getByRole('button', { name: 'TEST Loppis' })).toBeTruthy();
    expect(screen.getByText('2 händelser matchar.')).toBeTruthy();
  });

  test('säger till när kategorin är tom, och Visa allt tömmer filtret', () => {
    render(<App />);
    fireEvent.click(pill('Natur & Fix'));

    expect(screen.getByText('Inget inplanerat i Natur & Fix just nu.')).toBeTruthy();
    fireEvent.click(pill('Visa allt'));
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
    expect(pill('Alla').getAttribute('aria-pressed')).toBe('true');
  });

  test('säger till när sökningen inte hittar något i kategorin, och Visa allt tömmer båda', () => {
    render(<App />);
    fireEvent.click(pill('Idrott & Motion'));
    search('loppis');

    expect(screen.getByText('Inget matchar ”loppis” i Idrott & Motion.')).toBeTruthy();
    fireEvent.click(pill('Visa allt'));
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(months()).toEqual(['Oktober 2026', 'November 2026']);
  });

  // jsdom räknar inte ut layout, så testet kontrollerar klassen. Bredden mäts i webbläsaren (#39).
  test('låter långa ord brytas var som helst i tidslinjen, så att sidan inte blir bredare än skärmen', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: 'Kommande händelser' }).className).toContain('wrap-anywhere');
  });
});
