// En bit av en beskrivning. Med href blir den en länk, annars vanlig text. Komponenten bygger länkarna själv, utan innerHTML.
export type TextPart = { text: string; href?: string };

const PATTERN = new RegExp(
  [
    String.raw`(?<url>https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)`,
    String.raw`(?<email>[\w.+-]+@[\w-]+(?:\.[\w-]+)+)`,
    // Börjar med 0 eller +46 och står inte mitt i ett ord eller ett datum. Antalet siffror kontrolleras nedan.
    String.raw`(?<phone>(?<![\w+-])(?:\+46|0)(?:[ -]?\d)+)`,
  ].join('|'),
  'g',
);

export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let rest = 0;
  const pushText = (value: string) => {
    if (!value) return;
    const last = parts.at(-1);
    if (last && !last.href) last.text += value;
    else parts.push({ text: value });
  };

  for (const match of text.matchAll(PATTERN)) {
    const link = toLink(match);
    if (!link) continue;
    pushText(text.slice(rest, match.index));
    parts.push(link);
    rest = match.index + link.text.length;
  }
  pushText(text.slice(rest));
  return parts;
}

function toLink(match: RegExpExecArray | RegExpMatchArray): TextPart | null {
  const { url, email, phone } = match.groups ?? {};
  if (url) {
    // Skiljetecken efter adressen hör till meningen, inte till länken.
    const clean = url.replace(/[.,!?;:]+$/, '');
    return { text: clean, href: clean.startsWith('www.') ? `https://${clean}` : clean };
  }
  if (email) return { text: email, href: `mailto:${email}` };
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 12 ? { text: phone, href: `tel:${phone.replace(/[ -]/g, '')}` } : null;
  }
  return null;
}
