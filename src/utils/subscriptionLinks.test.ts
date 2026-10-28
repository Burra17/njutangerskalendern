import { describe, expect, test } from 'vitest';
import { subscriptionLinks } from './subscriptionLinks';

describe('subscriptionLinks', () => {
  const links = subscriptionLinks('abc123@group.calendar.google.com');

  test('bygger webcal- och https-adressen till kalenderns publika .ics, med @ kodat', () => {
    expect(links.webcal).toBe('webcal://calendar.google.com/calendar/ical/abc123%40group.calendar.google.com/public/basic.ics');
    expect(links.https).toBe('https://calendar.google.com/calendar/ical/abc123%40group.calendar.google.com/public/basic.ics');
  });

  test('bygger Googles länk som lägger till kalendern', () => {
    const url = new URL(links.google);
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('cid')).toBe('abc123@group.calendar.google.com');
  });
});
