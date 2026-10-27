import { useMemo } from 'react';
import { readCalendarSettings } from '../services/calendarSettings';
import { toCalendarEvent } from '../services/eventMapper';
import { createMockEvents } from '../services/mockEvents';
import type { CalendarEvent } from '../types/calendar';

export type EventsState = { events: CalendarEvent[]; isLoading: boolean; error: string | null; isDemo: boolean };

const settings = readCalendarSettings(import.meta.env);

export function useEvents(): EventsState {
  // Med nyckel och kalender-ID blir listan tom tills hämtningen från Google kopplas in i #9.
  const events = useMemo(() => (settings ? [] : createMockEvents().map(toCalendarEvent)), []);
  return { events, isLoading: false, error: null, isDemo: settings === null };
}
