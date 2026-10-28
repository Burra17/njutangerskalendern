import { useState } from 'react';
import { villageConfig } from '../config/villageConfig';
import type { CalendarEvent } from '../types/calendar';
import { countRestOfWeek, headerDate, weekCountText } from '../utils/weekSummary';

// events är null medan kalendern laddar eller när den inte gick att hämta, och då visas bara datumet.
type Props = { events: CalendarEvent[] | null };

// Svarar på "Vad händer i byn?": en kort rad under namnet i mobilen, och datumet stort till höger på desktop (beslut i #49).
export default function Header({ events }: Props) {
  const [now] = useState(() => new Date());
  const count = events && countRestOfWeek(events, now);

  return (
    <header className='bg-emerald-800 text-white'>
      <div className='mx-auto max-w-6xl px-4 py-6 lg:flex lg:items-end lg:justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100 lg:hidden'>
          {headerDate(now, true)}
          {count !== null && `. ${weekCountText(count, true)}`}
        </p>
        <p className='hidden text-right text-emerald-100 lg:block'>
          <span className='block text-3xl font-bold tracking-tight text-white'>{headerDate(now)}</span> {count !== null && weekCountText(count)}
        </p>
      </div>
    </header>
  );
}
