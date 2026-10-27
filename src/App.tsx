import DemoBanner from './components/DemoBanner';
import EventTimeline from './components/EventTimeline';
import Header from './components/Header';
import { useEvents } from './hooks/useEvents';

export default function App() {
  const { events, isLoading, error, isDemo, retry } = useEvents();

  return (
    <>
      {isDemo && <DemoBanner />}
      <Header />
      <main className='mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3'>
        <section aria-label='Kommande händelser' className='lg:col-span-2'>
          <EventTimeline events={events} isLoading={isLoading} error={error} onRetry={retry} />
        </section>
        {/* Platshållaren ersätts av sidopanelen (#18). */}
        <aside aria-label='Sidopanel' className='rounded-lg border border-dashed border-slate-300 p-6 text-slate-500'>
          Sidopanelen kommer här.
        </aside>
      </main>
    </>
  );
}
