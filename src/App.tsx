import { useRef, useState } from 'react';
import DemoBanner from './components/DemoBanner';
import EventTimeline from './components/EventTimeline';
import FilterBar from './components/FilterBar';
import Header from './components/Header';
import { useEvents } from './hooks/useEvents';
import type { SelectedCategory } from './utils/categoryParser';
import { filterByCategory, searchEvents } from './utils/eventSearch';

export default function App() {
  const { events, isLoading, error, isDemo, retry } = useEvents();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SelectedCategory>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Ett byte av kategori långt ner hoppar hit, så att listan börjar precis under den klistriga raden.
  const listStartRef = useRef<HTMLDivElement>(null);

  // Fokus tillbaka till sökfältet, så att den som rensar kan skriva något nytt direkt.
  function clearSearch() {
    setQuery('');
    searchRef.current?.focus();
  }

  // Fokus till sökfältet bara när det fanns en sökning, så att mobilens tangentbord inte öppnas i onödan.
  function resetFilters() {
    setCategory(null);
    if (query) clearSearch();
  }

  function selectCategory(next: SelectedCategory) {
    setCategory(next);
    if (!listStartRef.current) return;
    const listStart = listStartRef.current.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > listStart) window.scrollTo({ top: listStart });
  }

  return (
    <>
      {isDemo && <DemoBanner />}
      <Header />
      <div ref={listStartRef} />
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        onClear={clearSearch}
        searchRef={searchRef}
        category={category}
        onCategoryChange={selectCategory}
      />
      <main className='mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3'>
        <section aria-label='Kommande händelser' className='lg:col-span-2'>
          <EventTimeline
            events={searchEvents(filterByCategory(events, category), query)}
            query={query}
            category={category}
            onReset={resetFilters}
            isLoading={isLoading}
            error={error}
            onRetry={retry}
          />
        </section>
        {/* Platshållaren ersätts av sidopanelen (#18). */}
        <aside aria-label='Sidopanel' className='rounded-lg border border-dashed border-slate-300 p-6 text-slate-500'>
          Sidopanelen kommer här.
        </aside>
      </main>
    </>
  );
}
