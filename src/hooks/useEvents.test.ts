// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Hooken läser miljövariablerna när modulen laddas, så varje test laddar den på nytt efter att variablerna satts.
async function importUseEvents(env: Record<string, string>) {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  vi.resetModules();
  return (await import('./useEvents')).useEvents;
}

const googleEnv = { VITE_GOOGLE_API_KEY: 'nyckel', VITE_GOOGLE_CALENDAR_ID: 'abc@group.calendar.google.com' };
const fikaItems = {
  items: [{ id: 'e1', summary: '☕ Fika', start: { dateTime: '2026-06-19T15:00:00+02:00' }, end: { dateTime: '2026-06-19T16:00:00+02:00' } }],
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe('useEvents', () => {
  test('ger mockhändelserna direkt i demoläge', async () => {
    const useEvents = await importUseEvents({ VITE_GOOGLE_API_KEY: '', VITE_GOOGLE_CALENDAR_ID: '' });
    const { result } = renderHook(() => useEvents());

    expect(result.current).toMatchObject({ isDemo: true, isLoading: false, error: null });
    // 13 enstaka händelser och en veckoaktivitet med fyra tillfällen, som blir ett kort.
    expect(result.current.events).toHaveLength(14);
    expect(result.current.events.find((event) => event.series)?.series?.later).toHaveLength(3);
  });

  test('laddar händelserna från Google', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(fikaItems))),
    );
    const useEvents = await importUseEvents(googleEnv);
    const { result } = renderHook(() => useEvents());

    expect(result.current).toMatchObject({ isDemo: false, isLoading: true, events: [] });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events.map((event) => event.title)).toEqual(['☕ Fika']);
    expect(result.current.error).toBeNull();
  });

  test('visar samma vänliga fel när nätet saknas', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const useEvents = await importUseEvents(googleEnv);
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.error).toBe('Kalendern gick inte att hämta just nu.'));
    expect(result.current).toMatchObject({ isLoading: false, events: [] });
  });

  test('visar ett vänligt fel och kan försöka igen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(fikaItems)));
    vi.stubGlobal('fetch', fetch);
    const useEvents = await importUseEvents(googleEnv);
    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.error).toBe('Kalendern gick inte att hämta just nu.'));
    expect(result.current.isLoading).toBe(false);

    act(() => result.current.retry());
    expect(result.current).toMatchObject({ isLoading: true, error: null });
    await waitFor(() => expect(result.current.events).toHaveLength(1));
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
