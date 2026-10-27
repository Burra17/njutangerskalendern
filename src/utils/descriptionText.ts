// Google sparar beskrivningar från webben som HTML. Ingen HTML från kalendern ska nå sidan.
export function toPlainText(html: string): string {
  const text = html
    .replace(/\r\n?/g, '\n')
    .replace(/<a\s[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, (_link, href: string, text: string) => linkText(href, text))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(ul|ol)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    // Google skriver ofta <br> före listan, och då ska ingen tom rad hamna före första punkten.
    .replace(/\n+• /g, '\n• ')
    // Efter taggarna, så att "&lt;b&gt;" blir texten "<b>" och inte en tagg.
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity);
  return tidyLines(text);
}

// "Arrangör: X" på en egen rad visas i kortets sidfot och tas därför bort ur texten.
export function extractOrganizer(text: string): { organizer?: string; text: string } {
  const match = text.match(/^[ \t]*arrangör[ \t]*:(.*)(\n|$)/imu);
  if (!match) return { organizer: undefined, text };
  return { organizer: match[1].trim() || undefined, text: tidyLines(text.replace(match[0], '')) };
}

function tidyLines(text: string): string {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  aring: 'å',
  auml: 'ä',
  ouml: 'ö',
  Aring: 'Å',
  Auml: 'Ä',
  Ouml: 'Ö',
  eacute: 'é',
  ndash: '–',
  mdash: '—',
  hellip: '…',
};

// En entitet som inte går att avkoda lämnas som den är, så att en trasig beskrivning inte tar ned hela listan.
function decodeEntity(entity: string, code: string): string {
  const codePoint =
    code.startsWith('#x') || code.startsWith('#X') ? parseInt(code.slice(2), 16) : code.startsWith('#') ? parseInt(code.slice(1), 10) : null;
  if (codePoint === null) return NAMED_ENTITIES[code] ?? NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
}

// Texten behålls när den säger något mer än adressen, och adressen blir klickbar i kortet.
function linkText(href: string, text: string): string {
  const label = text.replace(/<[^>]*>/g, '').trim();
  return !label || label === href ? href : `${label} (${href})`;
}
