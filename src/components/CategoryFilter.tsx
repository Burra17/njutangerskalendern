import { CATEGORIES, type SelectedCategory } from '../utils/categoryParser';

type Props = { selected: SelectedCategory; onSelect: (category: SelectedCategory) => void };

const PILLS = [{ id: null, label: 'Alla', shortLabel: 'Alla', dotClass: null }, ...CATEGORIES];

// Vita piller med en prick i etikettens färg, så att raden är lugn men hänger ihop med korten. Bara den valda knappen har färg (#48).
// I mobilen en rad som skrollar i sidled, med uttonad högerkant som visar att det finns fler.
export default function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <div
      role='group'
      aria-label='Visa kategori'
      className='flex [scrollbar-width:none] gap-2 overflow-x-auto mask-r-from-85% pr-8 lg:flex-wrap lg:overflow-visible lg:mask-none lg:pr-0 [&::-webkit-scrollbar]:hidden'
    >
      {PILLS.map((pill) => {
        const pressed = pill.id === selected;
        // Det tillgängliga namnet är hela kategorinamnet, som börjar med det korta namnet som syns.
        return (
          <button
            key={pill.id ?? 'alla'}
            type='button'
            aria-pressed={pressed}
            aria-label={pill.label}
            onClick={() => onSelect(pill.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-medium whitespace-nowrap ${pressed ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            {pill.dotClass && <span aria-hidden className={`size-2.5 rounded-full ${pressed ? 'bg-white' : pill.dotClass}`} />}
            {pill.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
