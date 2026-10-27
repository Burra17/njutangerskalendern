import DemoBanner from './components/DemoBanner';
import Header from './components/Header';
import { readCalendarSettings } from './services/calendarSettings';

const isDemo = readCalendarSettings(import.meta.env) === null;

export default function App() {
  return (
    <>
      {isDemo && <DemoBanner />}
      <Header />
      <main className='mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3'>
        {/* Platshållarna ersätts av tidslinjen (#11) och sidopanelen (#18). */}
        <section aria-label='Kommande händelser' className='rounded-lg border border-dashed border-slate-300 p-6 text-slate-500 lg:col-span-2'>
          Händelserna kommer här.
        </section>
        <aside aria-label='Sidopanel' className='rounded-lg border border-dashed border-slate-300 p-6 text-slate-500'>
          Sidopanelen kommer här.
        </aside>
      </main>
    </>
  );
}
