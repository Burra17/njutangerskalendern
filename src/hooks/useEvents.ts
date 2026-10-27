import { useEffect, useMemo, useState } from 'react';
import { loadEvents } from '../services/calendarService';
import { readCalendarSettings } from '../services/calendarSettings';
import { toCalendarEvent } from '../services/eventMapper';
import { createMockEvents } from '../services/mockEvents';
import type { CalendarEvent } from '../types/calendar';
import { mergeSeries } from '../utils/recurringSeries';

export type EventsState = { events: CalendarEvent[]; isLoading: boolean; error: string | null; isDemo: boolean; retry: () => void };

const ERROR_MESSAGE = 'Kalendern gick inte att hämta just nu.';

const settings = readCalendarSettings(import.meta.env);

export function useEvents(): EventsState {
  const mockEvents = useMemo(() => (settings ? null : mergeSeries(createMockEvents().map(toCalendarEvent))), []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(settings !== null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!settings) return;
    let active = true;
    // fetch slås in, eftersom webbläsaren kastar ett fel när den anropas lösryckt från window.
    loadEvents(settings, { fetch: (url) => fetch(url), storage: sessionStorageOrNothing(), now: new Date() })
      .then((loaded) => {
        if (active) setEvents(mergeSeries(loaded));
      })
      .catch((reason: unknown) => {
        // Byborna får ett och samma meddelande. Detaljerna, som fel nyckel eller nätverk, hamnar i konsolen.
        console.error(reason);
        if (active) setError(ERROR_MESSAGE);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    setAttempt((count) => count + 1);
  };

  if (mockEvents) return { events: mockEvents, isLoading: false, error: null, isDemo: true, retry };
  return { events, isLoading, error, isDemo: false, retry };
}

// Redan åtkomsten till sessionStorage kastar ett fel när webbplatsdata är blockerad.
function sessionStorageOrNothing(): Pick<Storage, 'getItem' | 'setItem'> {
  try {
    return window.sessionStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
}
