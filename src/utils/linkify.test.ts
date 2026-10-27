import { describe, expect, test } from 'vitest';
import { linkify } from './linkify';

const links = (text: string) => linkify(text).filter((part) => part.href);

describe('linkify', () => {
  test('lämnar text utan länkar som en enda bit', () => {
    expect(linkify('Ta med kaffe.')).toEqual([{ text: 'Ta med kaffe.' }]);
  });

  test('gör webbadresser klickbara och ger www. https', () => {
    expect(linkify('Läs mer på https://example.com/a?b=1 i dag')).toEqual([
      { text: 'Läs mer på ' },
      { text: 'https://example.com/a?b=1', href: 'https://example.com/a?b=1' },
      { text: ' i dag' },
    ]);
    expect(links('Se www.example.com.')).toEqual([{ text: 'www.example.com', href: 'https://www.example.com' }]);
  });

  test('tar inte med skiljetecken och parentes efter adressen', () => {
    expect(links('Vandrarhem (https://www.efsbrogarden.se)')).toEqual([{ text: 'https://www.efsbrogarden.se', href: 'https://www.efsbrogarden.se' }]);
    expect(links('Anmälan: https://example.com/anmalan, tack!')).toEqual([
      { text: 'https://example.com/anmalan', href: 'https://example.com/anmalan' },
    ]);
  });

  test('gör mejladresser klickbara', () => {
    expect(links('Mejla loppis@example.com.')).toEqual([{ text: 'loppis@example.com', href: 'mailto:loppis@example.com' }]);
  });

  test.each([
    ['070-174 06 05', 'tel:0701740605'],
    ['0701740605', 'tel:0701740605'],
    ['0650-123 45', 'tel:065012345'],
    ['+46 70 174 06 05', 'tel:+46701740605'],
  ])('gör telefonnumret %s klickbart', (number, href) => {
    expect(links(`Ring ${number} för bord.`)).toEqual([{ text: number, href }]);
  });

  test.each([
    ['ett datum', 'Datum: 2026-10-28'],
    ['en tid', 'Kl. 08:00–09:30'],
    ['ett kort nummer', 'Rum 012'],
    ['en ålder', 'För barn 0-4 år'],
    ['ett för långt nummer', 'Kundnummer 0123456789012345'],
  ])('gör inte %s till ett telefonnummer', (_name, text) => {
    expect(links(text)).toEqual([]);
  });

  test('hittar flera saker i samma text, i ordning', () => {
    expect(links('Ring 070-174 06 99 eller mejla bokcirkel@example.com, se www.example.com')).toEqual([
      { text: '070-174 06 99', href: 'tel:0701740699' },
      { text: 'bokcirkel@example.com', href: 'mailto:bokcirkel@example.com' },
      { text: 'www.example.com', href: 'https://www.example.com' },
    ]);
  });
});
