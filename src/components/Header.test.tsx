// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import Header from './Header';

// Onsdag 28 oktober 2026 kl. 12:00 i Stockholm.
const now = new Date('2026-10-28T11:00:00Z');
const fika: CalendarEvent = { id: 'fika', title: 'Fika', category: 'fika', allDay: true, startDate: '2026-10-29', endDate: '2026-10-29' };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Header', () => {
  test('visar datum och veckans antal', () => {
    vi.useFakeTimers({ now });
    render(<Header events={[fika]} />);

    expect(screen.getByText('Onsdag 28 okt. 1 händelse i veckan.')).toBeTruthy();
    expect(screen.getByText('1 sak händer den här veckan.', { exact: false })).toBeTruthy();
  });

  test('visar bara datumet medan kalendern laddar eller när den inte gick att hämta', () => {
    vi.useFakeTimers({ now });
    render(<Header events={null} />);

    expect(screen.getByText('Onsdag 28 okt')).toBeTruthy();
    expect(screen.queryByText('veckan', { exact: false })).toBeNull();
  });
});
