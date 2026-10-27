import { describe, expect, test } from 'vitest';
import { readCalendarSettings } from './calendarSettings';

describe('readCalendarSettings', () => {
  test('ger nyckel och kalender-ID när båda finns', () => {
    expect(readCalendarSettings({ VITE_GOOGLE_API_KEY: 'nyckel', VITE_GOOGLE_CALENDAR_ID: 'id@group.calendar.google.com' })).toEqual({
      apiKey: 'nyckel',
      calendarId: 'id@group.calendar.google.com',
    });
  });

  test('ger null, alltså demoläge, när någon av dem saknas', () => {
    expect(readCalendarSettings({})).toBeNull();
    expect(readCalendarSettings({ VITE_GOOGLE_API_KEY: 'nyckel' })).toBeNull();
    expect(readCalendarSettings({ VITE_GOOGLE_CALENDAR_ID: 'id' })).toBeNull();
  });

  test('räknar tomma värden och bara mellanslag som saknade', () => {
    expect(readCalendarSettings({ VITE_GOOGLE_API_KEY: '', VITE_GOOGLE_CALENDAR_ID: 'id' })).toBeNull();
    expect(readCalendarSettings({ VITE_GOOGLE_API_KEY: 'nyckel', VITE_GOOGLE_CALENDAR_ID: '  ' })).toBeNull();
  });

  test('tar bort mellanslag runt värdena', () => {
    expect(readCalendarSettings({ VITE_GOOGLE_API_KEY: ' nyckel ', VITE_GOOGLE_CALENDAR_ID: ' id ' })).toEqual({
      apiKey: 'nyckel',
      calendarId: 'id',
    });
  });
});
