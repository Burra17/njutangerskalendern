// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import SubscribeButton from './SubscribeButton';

const calendarId = 'abc123@group.calendar.google.com';
const ics = 'calendar.google.com/calendar/ical/abc123%40group.calendar.google.com/public/basic.ics';
const google = 'https://calendar.google.com/calendar/render?cid=abc123%40group.calendar.google.com';

function onDevice(userAgent: string) {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
}

function withClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SubscribeButton', () => {
  test('ger webcal på iPhone, med Googles länk som reserv', () => {
    onDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1');
    render(<SubscribeButton calendarId={calendarId} />);

    expect(screen.getByRole('link', { name: 'Synka hela kalendern till mobilen' }).getAttribute('href')).toBe(`webcal://${ics}`);
    expect(screen.getByRole('link', { name: 'Använder du Google Kalender?' }).getAttribute('href')).toBe(google);
    expect(screen.getByText('Nya händelser dyker upp i din kalender av sig själva.')).toBeTruthy();
  });

  test('ger Googles länk på Android, och kopierar https-adressen till andra kalendrar', async () => {
    onDevice('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36');
    const writeText = vi.fn(() => Promise.resolve());
    withClipboard(writeText);
    render(<SubscribeButton calendarId={calendarId} />);

    expect(screen.getByRole('link', { name: 'Synka hela kalendern till mobilen' }).getAttribute('href')).toBe(google);
    fireEvent.click(screen.getByRole('button', { name: 'Annan kalender? Kopiera adressen' }));

    expect(writeText).toHaveBeenCalledWith(`https://${ics}`);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Kopierad!' })).toBeTruthy());
  });

  test('visar adressen när urklippet inte fungerar', async () => {
    onDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36');
    withClipboard(() => Promise.reject(new Error('nekad')));
    render(<SubscribeButton calendarId={calendarId} />);

    fireEvent.click(screen.getByRole('button', { name: 'Annan kalender? Kopiera adressen' }));

    await waitFor(() => expect(screen.getByText(`https://${ics}`)).toBeTruthy());
  });

  test('är inaktiv i demoläget och förklarar varför', () => {
    render(<SubscribeButton calendarId={null} />);

    expect((screen.getByRole('button', { name: 'Synka hela kalendern till mobilen' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Fungerar när den riktiga kalendern är kopplad.')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
