import { describe, expect, test } from 'vitest';
import lathund from '../../docs/lathund.md?raw';
import { CATEGORIES } from './categoryParser';

// Lathunden skrivs för hand. Testet fallerar när en kategori, emoji eller ett nyckelord läggs till i koden men glöms där.
describe('docs/lathund.md', () => {
  test.each(CATEGORIES.map((category) => [category.label, category]))('tar upp %s', (_label, category) => {
    expect(lathund).toContain(category.label);
    for (const emoji of category.emojis) expect(lathund).toContain(emoji);
    for (const keyword of category.keywords) expect(lathund).toContain(keyword);
  });

  test('beskriver kalendern och raden Arrangör:', () => {
    expect(lathund).toContain('Njutångerskalendern');
    expect(lathund).toContain('Arrangör:');
  });
});
