import type { CalendarEvent } from '../types/calendar';
import { startDay } from '../utils/dates';
import { groupByMonth } from '../utils/monthGroups';

type Props = { events: CalendarEvent[]; isLoading: boolean; error: string | null; onRetry: () => void };

export default function EventTimeline({ events, isLoading, error, onRetry }: Props) {
  if (isLoading) return <p className='text-slate-600'>Hämtar kalendern …</p>;

  if (error) {
    return (
      <div className='rounded-lg border border-slate-200 bg-white p-6'>
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
          <ul className='space-y-2'>
            {group.events.map((event) => (
              // Platshållare tills de riktiga korten kommer i #12.
              <li key={event.id} className='rounded-lg border border-slate-200 bg-white px-4 py-3'>
                {`${shortDate(startDay(event))} · ${event.title}`}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const shortDateFormat = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function shortDate(day: string): string {
  return shortDateFormat.format(new Date(`${day}T12:00:00Z`)).replace('.', '');
}
