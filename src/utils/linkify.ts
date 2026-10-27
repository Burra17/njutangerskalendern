// En bit av en beskrivning. Med href blir den en länk, annars vanlig text.
export type TextPart = { text: string; href?: string };

const PATTERN = new RegExp(
  [
    String.raw`(?<url>https?:\/\/[^\s<>()"”]+|www\.[^\s<>()"”]+)`,
    // \p{L} i stället för \w, så att å, ä och ö räknas som bokstäver i mejladresser.
    String.raw`(?<email>(?<![\p{L}\p{N}._%+-])[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+)`,
    // Börjar med 0 eller +46 och står inte mitt i ett ord eller ett datum. Längden kontrolleras i toPhone.
    String.raw`(?<phone>(?<![\p{L}\p{N}+-])(?:\+46|0)(?:[ -]?\d)+)`,
  ].join('|'),
  'gu',
);

export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;
  const pushText = (value: string) => {
    if (!value) return;
    const last = parts.at(-1);
    if (last && !last.href) last.text += value;
    else parts.push({ text: value });
  };

  for (const match of text.matchAll(PATTERN)) {
    if (match.index < cursor) continue;
    const link = toLink(match.groups ?? {});
    if (!link) continue;
    pushText(text.slice(cursor, match.index));
    parts.push(link);
    cursor = match.index + link.text.length;
  }
  pushText(text.slice(cursor));
  return parts;
}

function toLink({ url, email, phone }: Record<string, string | undefined>): TextPart | null {
  if (url) {
    // Skiljetecken och citattecken efter adressen hör till meningen, inte till länken.
    const clean = url.replace(/[.,!?;:'’»]+$/, '');
    return { text: clean, href: clean.startsWith('www.') ? `https://${clean}` : clean };
  }
  if (email) return { text: email, href: `mailto:${email}` };
  if (phone) return toPhone(phone);
  return null;
}

// Ett svenskt nummer har högst 10 siffror, 11 med +46. Tal efter ett mellanslag som gör numret för långt, till exempel
// ett datum, hör inte till numret.
function toPhone(candidate: string): TextPart | null {
  const max = candidate.startsWith('+') ? 11 : 10;
  let phone = candidate;
  while (digits(phone) > max && phone.includes(' ')) phone = phone.slice(0, phone.lastIndexOf(' '));
  const count = digits(phone);
  return count >= 8 && count <= max ? { text: phone, href: `tel:${phone.replace(/[ -]/g, '')}` } : null;
}

function digits(text: string): number {
  return text.replace(/\D/g, '').length;
}
