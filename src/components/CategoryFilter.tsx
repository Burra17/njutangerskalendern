import { CATEGORIES, type SelectedCategory } from '../utils/categoryParser';

type Props = { selected: SelectedCategory; onSelect: (category: SelectedCategory) => void };

// TILLFÄLLIG: förslag för #48, som väljs med ?filter=a, b eller c. Tas bort innan PR:en mergas.
const FILTER_VARIANT = new URLSearchParams(window.location.search).get('filter');
const DOTS: Record<string, string> = {
  fika: 'bg-amber-400',
  natur: 'bg-emerald-500',
  loppis: 'bg-purple-500',
  moten: 'bg-blue-500',
  idrott: 'bg-rose-500',
  ovrigt: 'bg-slate-400',
};

const PILLS = [{ id: null, label: 'Alla', emoji: null, badgeClass: 'bg-slate-100 text-slate-700' }, ...CATEGORIES];

// I mobilen en rad som skrollar i sidled, med uttonad högerkant som visar att det finns fler. På desktop bryts den till fler rader.
export default function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <div
      role='group'
      aria-label='Visa kategori'
      className='flex [scrollbar-width:none] gap-2 overflow-x-auto mask-r-from-85% pr-8 lg:flex-wrap lg:overflow-visible lg:mask-none lg:pr-0 [&::-webkit-scrollbar]:hidden'
    >
      {PILLS.map((pill) => {
        const pressed = pill.id === selected;
        return (
          <button
            key={pill.id ?? 'alla'}
            type='button'
            aria-pressed={pressed}
            onClick={() => onSelect(pill.id)}
            className={
              FILTER_VARIANT === 'a'
                ? `shrink-0 rounded-full px-3 py-1.5 text-base font-medium whitespace-nowrap ${pressed ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
                : FILTER_VARIANT === 'b' || FILTER_VARIANT === 'c'
                  ? `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-medium whitespace-nowrap ${pressed ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`
                  : `shrink-0 rounded-full px-3 py-1.5 text-base font-medium whitespace-nowrap ${pressed ? 'bg-emerald-800 text-white' : `${pill.badgeClass} hover:brightness-95`}`
            }
          >
            {FILTER_VARIANT === 'c' && pill.id && <span aria-hidden className={`size-2.5 rounded-full ${pressed ? 'bg-white' : DOTS[pill.id]}`} />}
            {FILTER_VARIANT !== 'a' && FILTER_VARIANT !== 'c' && pill.emoji && <span aria-hidden>{pill.emoji} </span>}
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
