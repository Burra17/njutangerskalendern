// Den enda listan över kategorier. Ordningen är filterknapparnas ordning, och docs/lathund.md ska spegla innehållet.
export const CATEGORIES = [
  {
    id: 'fika',
    label: 'Fika & Gemenskap',
    emoji: '☕',
    emojis: ['☕', '🇸🇪', '🎉'],
    keywords: ['fika', 'fest', 'midsommar', 'pub', 'grill'],
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'natur',
    label: 'Natur & Fix',
    emoji: '🌲',
    emojis: ['🧹', '🌸', '🌲'],
    keywords: ['städ', 'arbetsdag', 'brygga', 'vandring', 'fixa'],
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'loppis',
    label: 'Loppis & Marknad',
    emoji: '🏷️',
    emojis: ['🏷️', '🛍️'],
    keywords: ['loppis', 'marknad', 'baklucke', 'auktion'],
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'moten',
    label: 'Möten & Beslut',
    emoji: '📋',
    emojis: ['📋', '🏛️'],
    keywords: ['möte', 'årsmöte', 'stämma', 'styrelse'],
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'idrott',
    label: 'Idrott & Motion',
    emoji: '⚽',
    emojis: ['⚽', '🏃'],
    keywords: ['träning', 'fotboll', 'gympa', 'bastu'],
    badgeClass: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'ovrigt',
    label: 'Övrigt',
    emoji: null,
    emojis: [],
    keywords: [],
    badgeClass: 'bg-slate-100 text-slate-700',
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

// Den kategori som filtret visar. null betyder Alla.
export type SelectedCategory = CategoryId | null;

export function categoryById(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES.find((category) => category.id === 'ovrigt')!;
}

// Titeln går först. Beskrivningen ska komma utan raden "Arrangör:", eftersom arrangören säger vem och inte vad.
export function categorize(title: string, description = ''): CategoryId {
  return firstMatch(normalize(title)) ?? firstMatch(normalize(description)) ?? 'ovrigt';
}

// Kategorin vars emoji eller nyckelord står först i texten, så att "Årsmöte med fika" blir ett möte.
function firstMatch(text: string): CategoryId | null {
  let best: { id: CategoryId; index: number } | null = null;
  for (const category of CATEGORIES) {
    const indexes = [
      ...category.emojis.map((emoji: string) => text.indexOf(normalize(emoji))),
      ...category.keywords.map((keyword: string) => findKeyword(text, keyword)),
    ];
    for (const index of indexes) {
      if (index !== -1 && (best === null || index < best.index)) best = { id: category.id, index };
    }
  }
  return best?.id ?? null;
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
