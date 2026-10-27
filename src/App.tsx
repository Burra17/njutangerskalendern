import DemoBanner from './components/DemoBanner';
import Header from './components/Header';
import { useEvents } from './hooks/useEvents';

export default function App() {
  const { events, isDemo } = useEvents();

  return (
    <>
      {isDemo && <DemoBanner />}
      <Header />
      <main className='mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3'>
        {/* Platshållarna ersätts av tidslinjen (#11) och sidopanelen (#18). */}
        <section aria-label='Kommande händelser' className='rounded-lg border border-dashed border-slate-300 p-6 text-slate-500 lg:col-span-2'>
          {events.length} händelser kommer här.
        </section>
        <aside aria-label='Sidopanel' className='rounded-lg border border-dashed border-slate-300 p-6 text-slate-500'>
          Sidopanelen kommer här.
        </aside>
      </main>
    </>
  );
}
