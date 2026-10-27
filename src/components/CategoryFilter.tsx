import { CATEGORIES, type SelectedCategory } from '../utils/categoryParser';

type Props = { selected: SelectedCategory; onSelect: (category: SelectedCategory) => void };

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
            className={`shrink-0 rounded-full px-3 py-1.5 text-base font-medium whitespace-nowrap ${pressed ? 'bg-emerald-800 text-white' : `${pill.badgeClass} hover:brightness-95`}`}
          >
            {pill.emoji && <span aria-hidden>{pill.emoji} </span>}
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
