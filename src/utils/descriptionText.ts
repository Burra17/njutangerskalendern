// Google sparar beskrivningar från webben som HTML. Den görs om till ren text, så att ingen HTML från kalendern når sidan.
export function toPlainText(html: string): string {
  return html
    .replace(/<a\s[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, (_link, href: string, text: string) => linkText(href, text))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// "Arrangör: X" på en egen rad visas i kortets sidfot och tas därför bort ur texten.
export function extractOrganizer(text: string): { organizer?: string; text: string } {
  const match = text.match(/^[ \t]*arrangör[ \t]*:(.*)(\n|$)/imu);
  if (!match) return { organizer: undefined, text };
  return { organizer: match[1].trim() || undefined, text: text.replace(match[0], '').trim() };
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// Avkodas efter att taggarna tagits bort, så att "&lt;b&gt;" blir texten "<b>" och inte en tagg.
function decodeEntity(entity: string, code: string): string {
  if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(parseInt(code.slice(2), 16));
  if (code.startsWith('#')) return String.fromCodePoint(parseInt(code.slice(1), 10));
  return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
}

// Adressen skrivs ut så att den blir klickbar i kortet. Texten behålls när den säger något mer än adressen.
function linkText(href: string, text: string): string {
  const label = text.replace(/<[^>]*>/g, '').trim();
  return !label || label === href ? href : `${label} (${href})`;
}
