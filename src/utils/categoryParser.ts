// Den enda listan över kategorier. Ordningen är filterknapparnas ordning, och docs/lathund.md ska spegla innehållet.
// shortLabel och dotClass används bara i filterraden, där pricken har samma färg som etiketten i korten (#48).
export const CATEGORIES = [
  {
    id: 'gemenskap',
    label: 'Gemenskap',
    emoji: '☕',
    emojis: ['☕', '🇸🇪', '🎉'],
    keywords: ['fika', 'fest', 'servering', 'café', 'midsommar', 'pub', 'grill', 'städ', 'arbetsdag', 'fixa'],
    badgeClass: 'bg-amber-100 text-amber-800',
    shortLabel: 'Gemenskap',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'kyrka',
    label: 'Kyrka',
    emoji: '⛪',
    emojis: ['⛪', '🕊️', '🕯️', '✝️', '📖', '🔔'],
    // "kyrk" är ett delord, så att Kyrkfika och Kyrkkör hamnar här och inte under Gemenskap (beslut i #54).
    keywords: ['gudstjänst', 'mässa', 'andakt', 'bön', 'psalm', 'kyrk', 'efs'],
    badgeClass: 'bg-sky-100 text-sky-800',
    shortLabel: 'Kyrka',
    dotClass: 'bg-sky-500',
  },
  {
    id: 'loppis',
    label: 'Loppis & Marknad',
    emoji: '🏷️',
    emojis: ['🏷️', '🛍️'],
    keywords: ['loppis', 'marknad', 'auktion', 'försäljning', 'baklucke'],
    badgeClass: 'bg-purple-100 text-purple-800',
    shortLabel: 'Loppis',
    dotClass: 'bg-purple-500',
  },
  {
    id: 'barn',
    label: 'Barn och ungdom',
    emoji: '🧒',
    emojis: ['🧒', '🎈', '⛺', '🎨'],
    keywords: ['barn', 'ungdom', 'scout', 'läger', 'fritids', 'kalas', 'lek'],
    badgeClass: 'bg-blue-100 text-blue-800',
    shortLabel: 'Barn',
    dotClass: 'bg-blue-500',
  },
  {
    id: 'idrott',
    label: 'Idrott',
    emoji: '⚽',
    emojis: ['⚽', '🏃'],
    keywords: ['träning', 'fotboll', 'gympa', 'bastu'],
    badgeClass: 'bg-rose-100 text-rose-800',
    shortLabel: 'Idrott',
    dotClass: 'bg-rose-500',
  },
  {
    id: 'ovrigt',
    label: 'Övrigt',
    emoji: null,
    emojis: [],
    keywords: [],
    badgeClass: 'bg-slate-100 text-slate-700',
    shortLabel: 'Övrigt',
    dotClass: 'bg-slate-400',
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

// Den kategori som filtret visar. null betyder Alla.
export type SelectedCategory = CategoryId | null;

export function categoryById(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES.find((category) => category.id === 'ovrigt')!;
}

// emoji är emojin i titeln som avgjorde kategorin, som den står där. Den saknas om ett ord eller beskrivningen avgjorde (#44).
export type Categorized = { category: CategoryId; emoji?: string };

// Titeln går först. Beskrivningen ska komma utan raden "Arrangör:", eftersom arrangören säger vem och inte vad.
export function categorize(title: string, description = ''): Categorized {
  const fromTitle = firstMatch(normalize(title));
  if (fromTitle) return { category: fromTitle.category, emoji: fromTitle.emoji && emojiAsWritten(title, fromTitle.emoji) };
  return { category: firstMatch(normalize(description))?.category ?? 'ovrigt' };
}

// Kategorin vars emoji eller nyckelord står först i texten, så att "Barnloppis" blir Barn och ungdom. emoji är normaliserad här.
function firstMatch(text: string): Categorized | null {
  let best: (Categorized & { index: number }) | null = null;
  for (const category of CATEGORIES) {
    const matches = [
      ...category.emojis.map((emoji: string) => normalize(emoji)).map((emoji) => ({ index: text.indexOf(emoji), emoji })),
      ...category.keywords.map((keyword: string) => ({ index: findKeyword(text, keyword), emoji: undefined })),
    ];
    for (const { index, emoji } of matches) {
      if (index !== -1 && (best === null || index < best.index)) best = { category: category.id, index, emoji };
    }
  }
  return best && { category: best.category, emoji: best.emoji };
}

// Emojin som den står i titeln, med variationstecknet om det finns, så att kortet kan ta bort exakt det som står där.
function emojiAsWritten(title: string, bare: string): string {
  const index = title.indexOf(bare);
  return title.slice(index, index + bare.length) + (title[index + bare.length] === '\u{FE0F}' ? '\u{FE0F}' : '');
}

// Tangentbord skriver ibland ö som o plus prickar, och vissa emojis med variationstecknet U+FE0F. Båda jämnas ut.
function normalize(text: string): string {
  return text.normalize('NFC').replaceAll('\u{FE0F}', '').toLowerCase();
}

// Korta nyckelord måste vara hela ord, så att "pub" inte hittas i "publik". \b fungerar inte med å, ä och ö, därav \p{L}.
function findKeyword(text: string, keyword: string): number {
  if (keyword.length > 3) return text.indexOf(keyword);
  return text.search(new RegExp(`(?<![\\p{L}\\p{N}])${keyword}(?![\\p{L}\\p{N}])`, 'u'));
}
