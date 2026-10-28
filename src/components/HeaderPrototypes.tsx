// TILLFÄLLIG: tre förslag på header för #49, som väljs med ?header=a, b eller c. Tas bort innan PR:en mergas.
import { useState } from 'react';
import { villageConfig } from '../config/villageConfig';
import type { CalendarEvent, IsoDate } from '../types/calendar';
import { addDays, endDay, noonUtc, startDay, toStockholmDate } from '../utils/dates';
import { countRestOfWeek, headerDate, weekCountText } from '../utils/weekSummary';

type Props = { events: CalendarEvent[] | null };

const MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
const WEEKDAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const SERIF = { fontFamily: 'ui-serif, "New York", Georgia, "Times New Roman", serif' };

function useToday() {
  const [now] = useState(() => new Date());
  const today = toStockholmDate(now);
  const date = noonUtc(today);
  return { now, today, day: date.getUTCDate(), weekday: date.getUTCDay(), month: date.getUTCMonth() };
}

function countLine(events: CalendarEvent[] | null, now: Date, short: boolean) {
  return events ? weekCountText(countRestOfWeek(events, now), short) : '';
}

// A: ett blad ur en rivalmanacka som hänger från headerns överkant. Söndagar är röda, som i almanackan.
export function HeaderAlmanac({ events }: Props) {
  const { now, day, weekday, month } = useToday();
  const red = weekday === 0;
  return (
    <header className='bg-emerald-800 text-white'>
      <div className='mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 pt-6 pb-5 lg:pb-6'>
        <div className='pt-1'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl'>{villageConfig.siteName}</h1>
          <p className='mt-1 text-emerald-100 lg:mt-2 lg:text-xl'>
            <span className='lg:hidden'>{countLine(events, now, true)}</span>
            <span className='hidden lg:inline'>{countLine(events, now, false)}</span>
          </p>
        </div>
        <div
          aria-label={headerDate(now)}
          className='-mt-6 w-16 shrink-0 rounded-b-md bg-white text-center text-slate-900 shadow-lg ring-1 ring-black/5 lg:w-32'
        >
          {/* Perforeringen där bladet rivs av. */}
          <div aria-hidden className='h-2 border-b-2 border-dotted border-slate-300 bg-slate-100 lg:h-3' />
          <p className={`pt-1 text-xs font-semibold lg:pt-2 lg:text-base ${red ? 'text-red-700' : 'text-slate-500'}`}>{MONTHS[month]}</p>
          <p style={SERIF} className={`text-3xl leading-none font-bold lg:text-6xl ${red ? 'text-red-700' : 'text-slate-900'}`}>
            {day}
          </p>
          <p className={`pt-1 pb-2 text-xs lg:pb-3 lg:text-base ${red ? 'text-red-700' : 'text-slate-600'}`}>{WEEKDAYS[weekday]}</p>
        </div>
      </div>
    </header>
  );
}

// B: byn som siluett längs kanten: skog, en röd stuga, klockstapeln och vattnet.
export function HeaderVillage({ events }: Props) {
  const { now } = useToday();
  return (
    <header className='relative overflow-hidden bg-emerald-800 text-white'>
      <div className='relative mx-auto max-w-6xl px-4 pt-5 pb-12 lg:flex lg:items-start lg:justify-between lg:pt-6 lg:pb-20'>
        <h1 className='text-3xl font-bold tracking-tight lg:text-4xl'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100 lg:hidden'>
          {headerDate(now, true)}. {countLine(events, now, true)}
        </p>
        <p className='hidden text-right text-xl text-emerald-100 lg:block'>
          <span className='block text-3xl font-bold text-white'>{headerDate(now)}</span> {countLine(events, now, false)}
        </p>
      </div>
      <svg aria-hidden viewBox='0 0 1200 90' preserveAspectRatio='xMidYMax slice' className='absolute inset-x-0 bottom-0 h-10 w-full lg:h-20'>
        {/* Bakre skogen. */}
        <path
          fill='#0b5a45'
          d='M0 70 L40 40 L60 55 L90 25 L120 52 L150 30 L185 58 L230 34 L260 50 L300 22 L340 55 L380 38 L420 60 L470 30 L510 52 L560 36 L600 58 L650 28 L700 54 L740 40 L790 60 L840 32 L880 52 L930 26 L970 56 L1010 36 L1060 58 L1100 30 L1150 50 L1200 34 L1200 90 L0 90 Z'
        />
        {/* Klockstapeln. */}
        <g fill='#073d30'>
          <rect x='842' y='38' width='22' height='36' />
          <path d='M836 40 L853 14 L870 40 Z' />
          <rect x='851' y='4' width='4' height='12' />
        </g>
        {/* Främre skogen och marken. */}
        <path
          fill='#073d30'
          d='M0 78 L30 60 L55 74 L80 52 L110 76 L140 58 L170 78 L560 78 L590 56 L615 76 L640 50 L670 78 L1000 78 L1030 58 L1055 76 L1085 54 L1115 78 L1200 66 L1200 90 L0 90 Z'
        />
        {/* Den röda stugan med vita knutar. */}
        <g>
          <rect x='300' y='58' width='54' height='22' fill='#9b2d20' />
          <path d='M294 60 L327 40 L360 60 Z' fill='#4a1d17' />
          <rect x='300' y='58' width='3' height='22' fill='#f8fafc' />
          <rect x='351' y='58' width='3' height='22' fill='#f8fafc' />
          <rect x='322' y='66' width='10' height='14' fill='#f8fafc' />
        </g>
        {/* Vattnet. */}
        <rect y='80' width='1200' height='10' fill='#0f4f5c' />
        <path d='M60 85 h40 M220 84 h60 M480 86 h30 M720 84 h50 M960 86 h40' stroke='#5eead4' strokeOpacity='0.35' strokeWidth='1.5' />
      </svg>
    </header>
  );
}

// C: veckan som en remsa. Idag är markerad, och varje dag har en prick per händelse.
export function HeaderWeek({ events }: Props) {
  const { now, today, weekday } = useToday();
  const monday = addDays(today, -((weekday + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const occurrences = events ? events.flatMap((event) => [event, ...(event.series?.later ?? [])]) : [];
  const countOn = (date: IsoDate) => occurrences.filter((timing) => startDay(timing) <= date && endDay(timing) >= date).length;

  return (
    <header className='bg-emerald-800 text-white'>
      <div className='mx-auto max-w-6xl px-4 py-5 lg:flex lg:items-center lg:justify-between lg:py-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{villageConfig.siteName}</h1>
          <p className='mt-1 text-emerald-100'>{countLine(events, now, false)}</p>
        </div>
        <ol aria-label='Den här veckan' className='mt-4 grid grid-cols-7 gap-1 lg:mt-0 lg:w-[26rem]'>
          {days.map((date) => {
            const isToday = date === today;
            const past = date < today;
            const count = past ? 0 : countOn(date);
            const dayIndex = noonUtc(date).getUTCDay();
            return (
              <li
                key={date}
                className={`flex flex-col items-center rounded-lg py-1.5 ${isToday ? 'bg-white text-emerald-900' : past ? 'text-emerald-300/60' : 'text-white'}`}
              >
                <span className={`text-xs ${isToday ? 'font-semibold' : ''}`}>{WEEKDAYS[dayIndex].slice(0, 3)}</span>
                <span className='text-xl leading-tight font-bold'>{noonUtc(date).getUTCDate()}</span>
                <span aria-label={`${count} händelser`} className='flex h-2 gap-0.5'>
                  {Array.from({ length: Math.min(count, 3) }, (_, dot) => (
                    <span key={dot} className={`size-1.5 rounded-full ${isToday ? 'bg-emerald-700' : 'bg-amber-300'}`} />
                  ))}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
