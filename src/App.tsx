import { useRef, useState } from 'react';
import DemoBanner from './components/DemoBanner';
import EventTimeline from './components/EventTimeline';
import FilterBar from './components/FilterBar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useEvents } from './hooks/useEvents';
import type { SelectedCategory } from './utils/categoryParser';
import { filterByCategory, searchEvents } from './utils/eventSearch';

export default function App() {
  const { events, isLoading, error, isDemo, calendarId, retry } = useEvents();
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
      <Header events={events} isLoading={isLoading} />
      <div ref={listStartRef} />
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        onClear={clearSearch}
        searchRef={searchRef}
        category={category}
        onCategoryChange={selectCategory}
      />
      {/* grid-cols-1 och wrap-anywhere: ett långt ord i en händelse eller en sökning gör inte sidan bredare än skärmen (#39). */}
      <main className='mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3'>
        <section aria-label='Kommande händelser' className='wrap-anywhere lg:col-span-2'>
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
        <Sidebar calendarId={calendarId} />
      </main>
    </>
  );
}
