import { useRef, useState } from 'react';
import DemoBanner from './components/DemoBanner';
import EventTimeline from './components/EventTimeline';
import FilterBar from './components/FilterBar';
import Header from './components/Header';
import { useEvents } from './hooks/useEvents';
import { searchEvents } from './utils/eventSearch';

export default function App() {
  const { events, isLoading, error, isDemo, retry } = useEvents();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Fokus tillbaka till sökfältet, så att den som rensar kan skriva något nytt direkt.
  function clearSearch() {
    setQuery('');
    searchRef.current?.focus();
  }

  return (
    <>
      {isDemo && <DemoBanner />}
      <Header />
      <FilterBar query={query} onQueryChange={setQuery} onClear={clearSearch} searchRef={searchRef} />
      <main className='mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3'>
        <section aria-label='Kommande händelser' className='lg:col-span-2'>
          <EventTimeline
            events={searchEvents(events, query)}
            query={query}
            onClearQuery={clearSearch}
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
