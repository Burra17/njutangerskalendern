import { useState } from 'react';
import type { CalendarEvent } from '../types/calendar';
import { categoryById, type SelectedCategory } from '../utils/categoryParser';
import { groupByMonth } from '../utils/monthGroups';
import EventCard from './EventCard';

type Props = {
  events: CalendarEvent[];
  query: string;
  category: SelectedCategory;
  onReset: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function EventTimeline({ events, query, category, onReset, isLoading, error, onRetry }: Props) {
  // Idag och Pågår räknas fram när sidan visas. Ingen klocka uppdaterar dem medan sidan står öppen (beslut i #10).
  const [now] = useState(() => new Date());

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

  const search = query.trim();
  const categoryLabel = category && categoryById(category).label;

  // Raden för skärmläsare står kvar mellan sökningarna, så att varje ny träffbild läses upp.
  return (
    <>
      <p role='status' className='sr-only'>
        {(search || categoryLabel) && matchCount(events.length)}
      </p>
      <EventList events={events} search={search} categoryLabel={categoryLabel} onReset={onReset} now={now} />
    </>
  );
}

type EventListProps = { events: CalendarEvent[]; search: string; categoryLabel: string | null; onReset: () => void; now: Date };

function EventList({ events, search, categoryLabel, onReset, now }: EventListProps) {
  if (events.length === 0 && (search || categoryLabel)) {
    return (
      <div className='rounded-lg border border-slate-200 bg-white p-6'>
        <p>{noMatchText(search, categoryLabel)}</p>
        <button type='button' onClick={onReset} className='mt-4 rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900'>
          {categoryLabel ? 'Visa allt' : 'Rensa sökningen'}
        </button>
      </div>
    );
  }

  if (events.length === 0) return <p className='text-slate-600'>Inget inplanerat just nu. Titta in igen snart!</p>;

  return (
    <div className='space-y-8'>
      {groupByMonth(events).map((group) => (
        <section key={group.key} aria-labelledby={`month-${group.key}`}>
          <div className='mb-4 flex items-center gap-3'>
            <h2
              id={`month-${group.key}`}
              className='rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold tracking-wider text-emerald-800 uppercase'
            >
              {group.title}
            </h2>
            <span aria-hidden className='h-px flex-1 bg-slate-200' />
          </div>
          <ul className='space-y-3'>
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} now={now} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function noMatchText(search: string, categoryLabel: string | null): string {
  if (!categoryLabel) return `Inget matchar ”${search}”.`;
  return search ? `Inget matchar ”${search}” i ${categoryLabel}.` : `Inget inplanerat i ${categoryLabel} just nu.`;
}

function matchCount(count: number): string {
  if (count === 0) return 'Inga händelser matchar.';
  return count === 1 ? '1 händelse matchar.' : `${count} händelser matchar.`;
}
