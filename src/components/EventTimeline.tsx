import { useState } from 'react';
import type { CalendarEvent } from '../types/calendar';
import { groupByMonth } from '../utils/monthGroups';
import { EventCardVariant } from './prototype/EventCardVariants';
import PrototypeSwitcher, { readVariant } from './prototype/PrototypeSwitcher';

type Props = { events: CalendarEvent[]; isLoading: boolean; error: string | null; onRetry: () => void };

export default function EventTimeline({ events, isLoading, error, onRetry }: Props) {
  // PROTOTYP för #12: variant väljs med ?variant=.
  const [variant, setVariant] = useState(readVariant);

  if (isLoading) {
    return (
      <p role='status' className='text-slate-600'>
        Hämtar kalendern …
      </p>
    );
  }

  if (error) {
    return (
      <div role='alert' className='rounded-lg border border-slate-200 bg-white p-6'>
        <p>{error}</p>
        <button type='button' onClick={onRetry} className='mt-4 rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900'>
          Försök igen
        </button>
      </div>
    );
  }

  if (events.length === 0) return <p className='text-slate-600'>Inget inplanerat just nu. Titta in igen snart!</p>;

  return (
    <div className='space-y-8'>
      {groupByMonth(events).map((group) => (
        <section key={group.key} aria-labelledby={`month-${group.key}`}>
          <h2 id={`month-${group.key}`} className='mb-3 text-xl font-bold text-slate-900'>
            {group.title}
          </h2>
          <ul className='space-y-3'>
            {group.events.map((event) => (
              <EventCardVariant key={event.id} variant={variant} event={event} />
            ))}
          </ul>
        </section>
      ))}
      <PrototypeSwitcher current={variant} onChange={setVariant} />
    </div>
  );
}
