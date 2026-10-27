import { Search, X } from 'lucide-react';
import type { Ref } from 'react';
import type { SelectedCategory } from '../utils/categoryParser';
import CategoryFilter from './CategoryFilter';

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  searchRef: Ref<HTMLInputElement>;
  category: SelectedCategory;
  onCategoryChange: (category: SelectedCategory) => void;
};

// I mobilen står sökfältet överst och pillren under. På desktop står pillren till vänster om sökfältet.
export default function FilterBar({ query, onQueryChange, onClear, searchRef, category, onCategoryChange }: Props) {
  return (
    <div className='sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm'>
      <div className='mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-start'>
        <div role='search' className='relative w-full lg:w-80 lg:shrink-0'>
          <Search aria-hidden className='pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400' />
          {/* Webbläsarens eget kryss döljs, eftersom det ser olika ut och ibland saknas. Vårt ✕ ersätter det. */}
          <input
            ref={searchRef}
            type='search'
            aria-label='Sök händelser'
            placeholder='Sök händelser …'
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className='w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-10 pl-10 text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none'
          />
          {query && (
            <button
              type='button'
              aria-label='Töm sökfältet'
              onClick={onClear}
              className='absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800'
            >
              <X aria-hidden className='size-5' />
            </button>
          )}
        </div>
        <div className='min-w-0 lg:order-first lg:flex-1'>
          <CategoryFilter selected={category} onSelect={onCategoryChange} />
        </div>
      </div>
    </div>
  );
}
