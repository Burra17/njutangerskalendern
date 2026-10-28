export type SubscriptionLinks = { webcal: string; https: string; google: string };

// Kalenderns publika .ics hos Google, och Googles egen länk som lägger till kalendern direkt i Google Kalender (beslut i #17).
export function subscriptionLinks(calendarId: string): SubscriptionLinks {
  const id = encodeURIComponent(calendarId);
  const path = `calendar.google.com/calendar/ical/${id}/public/basic.ics`;
  return { webcal: `webcal://${path}`, https: `https://${path}`, google: `https://calendar.google.com/calendar/render?cid=${id}` };
}
