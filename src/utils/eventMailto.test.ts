import { describe, expect, test } from 'vitest';
import { eventMailto } from './eventMailto';

describe('eventMailto', () => {
  const link = eventMailto();

  test('går till kalenderns adress med ämnet, där å och mellanslag är kodade', () => {
    expect(link.startsWith('mailto:njutangerskalendern@gmail.com?subject=H%C3%A4ndelse%20till%20Njut%C3%A5ngerskalendern&')).toBe(true);
    expect(link).not.toContain('+');
  });

  test('har mallen med en rad för varje uppgift, med radbrytningar som %0D%0A', () => {
    expect(link.endsWith('&body=Vad%3A%0D%0AN%C3%A4r%3A%0D%0AVar%3A%0D%0AArrang%C3%B6r%3A%0D%0A')).toBe(true);
  });
});
