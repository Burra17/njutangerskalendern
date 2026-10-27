// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { CalendarEvent } from '../types/calendar';
import EventTimeline from './EventTimeline';

const fika: CalendarEvent = {
  id: 'fika',
  title: 'TEST ☕ Fika',
  category: 'fika',
  allDay: false,
  start: new Date('2026-10-28T14:30:00Z'),
  end: new Date('2026-10-28T15:30:00Z'),
};
const byfest: CalendarEvent = { id: 'byfest', title: 'TEST Byfest', category: 'fika', allDay: true, startDate: '2026-11-01', endDate: '2026-11-03' };

const idle = { events: [], query: '', category: null, onReset: () => {}, isLoading: false, error: null, onRetry: () => {} };

afterEach(cleanup);

describe('EventTimeline', () => {
  test('visar att kalendern hämtas', () => {
    render(<EventTimeline {...idle} isLoading />);
    expect(screen.getByText('Hämtar kalendern …')).toBeTruthy();
  });

  test('visar felet och försöker igen när man trycker på knappen', () => {
    const onRetry = vi.fn();
    render(<EventTimeline {...idle} error='Kalendern gick inte att hämta just nu.' onRetry={onRetry} />);

    expect(screen.getByText('Kalendern gick inte att hämta just nu.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('säger till när inget är inplanerat', () => {
    render(<EventTimeline {...idle} />);
    expect(screen.getByText('Inget inplanerat just nu. Titta in igen snart!')).toBeTruthy();
  });

  test('visar händelserna under sina månader', () => {
    render(<EventTimeline {...idle} events={[fika, byfest]} />);

    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Oktober 2026', 'November 2026']);
    expect(screen.getByRole('button', { name: 'TEST ☕ Fika' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'TEST Byfest' })).toBeTruthy();
  });
});
