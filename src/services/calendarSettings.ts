export type CalendarSettings = { apiKey: string; calendarId: string };

type CalendarEnv = { VITE_GOOGLE_API_KEY?: string; VITE_GOOGLE_CALENDAR_ID?: string };

// null betyder demoläge: utan både nyckel och kalender-ID finns inget att hämta.
export function readCalendarSettings(env: CalendarEnv): CalendarSettings | null {
  const apiKey = env.VITE_GOOGLE_API_KEY?.trim();
  const calendarId = env.VITE_GOOGLE_CALENDAR_ID?.trim();
  return apiKey && calendarId ? { apiKey, calendarId } : null;
}
