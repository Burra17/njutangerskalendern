// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import Sidebar from './Sidebar';

afterEach(cleanup);

describe('Sidebar', () => {
  test('har kortet för prenumerationen och kortet med mejllänken', () => {
    render(<Sidebar calendarId={null} />);

    const subscribe = screen.getByRole('region', { name: 'Ha byn i din egen mobil' });
    expect(within(subscribe).getByRole('button', { name: 'Synka hela kalendern till mobilen' })).toBeTruthy();

    const contact = screen.getByRole('region', { name: 'Vill du ha med något i kalendern?' });
    const mail = within(contact).getByRole('link', { name: 'Skicka ett mejl' });
    expect(mail.getAttribute('href')).toMatch(/^mailto:njutangerskalendern@gmail\.com\?subject=/);
    expect(within(contact).getByText('njutangerskalendern@gmail.com')).toBeTruthy();
  });
});
