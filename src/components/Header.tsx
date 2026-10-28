import { useState } from 'react';
import { villageConfig } from '../config/villageConfig';
import type { CalendarEvent } from '../types/calendar';
import { countThisWeek, headerDate, weekCountText } from '../utils/weekSummary';

type Props = { events: CalendarEvent[]; isLoading: boolean };

// Headern svarar på "Vad händer i byn?" med dagens datum och veckans antal (beslut i #49).
// Mobil: en kort rad under namnet, så att headern inte blir högre. Desktop: datumet stort till höger, så att bandet får innehåll i hela bredden.
export default function Header({ events, isLoading }: Props) {
  const [now] = useState(() => new Date());
  const count = isLoading ? null : countThisWeek(events, now);

  return (
    <header className='bg-emerald-800 text-white'>
      <div className='mx-auto max-w-6xl px-4 py-6 lg:flex lg:items-end lg:justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100 lg:hidden'>
          {headerDate(now, true)}. {count !== null && weekCountText(count, true)}
        </p>
        <p className='hidden text-right text-emerald-100 lg:block'>
          <span className='block text-3xl font-bold tracking-tight text-white'>{headerDate(now)}</span>
          {count !== null && weekCountText(count)}
        </p>
      </div>
    </header>
  );
}
