import { describe, expect, test } from 'vitest';
import { suggestEventMailto } from './contactLink';

describe('suggestEventMailto', () => {
  const link = suggestEventMailto('kalender@example.com');

  test('går till adressen med ämnet, där å och mellanslag är kodade', () => {
    expect(link.startsWith('mailto:kalender@example.com?subject=H%C3%A4ndelse%20till%20Njut%C3%A5ngerskalendern&')).toBe(true);
    expect(link).not.toContain('+');
  });

  test('har mallen med en rad för varje uppgift', () => {
    const body = decodeURIComponent(link.slice(link.indexOf('body=') + 'body='.length));
    expect(body).toBe('Vad:\r\nNär:\r\nVar:\r\nArrangör:\r\n');
  });
});
