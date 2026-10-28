import { useState } from 'react';
import { villageConfig } from '../config/villageConfig';
import type { CalendarEvent } from '../types/calendar';
import { countRestOfWeek, headerDate, weekCountText } from '../utils/weekSummary';

// events är null medan kalendern laddar eller när den inte gick att hämta, och då visas bara datumet.
type Props = { events: CalendarEvent[] | null };

// Svarar på "Vad händer i byn?" med datum och veckans antal, ovanför en siluett av byn (beslut i #49).
export default function Header({ events }: Props) {
  const [now] = useState(() => new Date());
  const count = events && countRestOfWeek(events, now);

  return (
    <header className='relative overflow-hidden bg-emerald-800 text-white'>
      <div className='relative mx-auto max-w-6xl px-4 pt-5 pb-9 lg:flex lg:items-start lg:justify-between lg:pt-6 lg:pb-14'>
        <h1 className='text-3xl font-bold tracking-tight'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100 lg:hidden'>
          {headerDate(now, true)}
          {count !== null && `. ${weekCountText(count, true)}`}
        </p>
        <p className='hidden text-right text-emerald-100 lg:block'>
          <span className='block text-2xl font-bold tracking-tight text-white'>{headerDate(now)}</span> {count !== null && weekCountText(count)}
        </p>
      </div>
      <VillageSilhouette />
    </header>
  );
}

// Skog, en röd stuga med vita knutar, klockstapeln och vattnet. Bara grönt, utom stugan, så att den inte blir clipart.
function VillageSilhouette() {
  return (
    <svg aria-hidden viewBox='0 0 1200 90' preserveAspectRatio='xMidYMax slice' className='absolute inset-x-0 bottom-0 h-8 w-full lg:h-14'>
      <path
        fill='#0b5a45'
        d='M0 70 L40 40 L60 55 L90 25 L120 52 L150 30 L185 58 L230 34 L260 50 L300 22 L340 55 L380 38 L420 60 L470 30 L510 52 L560 36 L600 58 L650 28 L700 54 L740 40 L790 60 L840 32 L880 52 L930 26 L970 56 L1010 36 L1060 58 L1100 30 L1150 50 L1200 34 L1200 90 L0 90 Z'
      />
      <g fill='#073d30'>
        <rect x='842' y='38' width='22' height='36' />
        <path d='M836 40 L853 14 L870 40 Z' />
        <rect x='851' y='4' width='4' height='12' />
      </g>
      <path
        fill='#073d30'
        d='M0 78 L30 60 L55 74 L80 52 L110 76 L140 58 L170 78 L560 78 L590 56 L615 76 L640 50 L670 78 L1000 78 L1030 58 L1055 76 L1085 54 L1115 78 L1200 66 L1200 90 L0 90 Z'
      />
      <g>
        <rect x='300' y='58' width='54' height='22' fill='#9b2d20' />
        <path d='M294 60 L327 40 L360 60 Z' fill='#4a1d17' />
        <rect x='300' y='58' width='3' height='22' fill='#f8fafc' />
        <rect x='351' y='58' width='3' height='22' fill='#f8fafc' />
        <rect x='322' y='66' width='10' height='14' fill='#f8fafc' />
      </g>
      <rect y='80' width='1200' height='10' fill='#0f4f5c' />
      <path d='M60 85 h40 M220 84 h60 M480 86 h30 M720 84 h50 M960 86 h40' stroke='#5eead4' strokeOpacity='0.35' strokeWidth='1.5' />
    </svg>
  );
}
