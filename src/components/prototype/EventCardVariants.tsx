// PROTOTYP för #12. Tre varianter av händelsekortet, valda med ?variant=A|B|C. Slängs när André har valt.
// Ingen av hjälpfunktionerna här är testad. De skrivs om ordentligt i utils/ när vinnaren byggs.
import { CalendarDays, CalendarPlus, ChevronDown, ChevronRight, Clock, MapPin, Repeat, User } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { CalendarEvent, EventTiming } from '../../types/calendar';
import { CATEGORIES } from '../../utils/categoryParser';
import { addDays, shortDate, startDay, toStockholmDate } from '../../utils/dates';

export const VARIANTS = { A: 'Datumbricka', B: 'Agenda', C: 'Färgband', D: 'Som Gemini' } as const;
export type VariantKey = keyof typeof VARIANTS;

export function EventCardVariant({ variant, event }: { variant: VariantKey; event: CalendarEvent }) {
  if (variant === 'B') return <AgendaRow event={event} />;
  if (variant === 'C') return <BandCard event={event} />;
  if (variant === 'D') return <GeminiCard event={event} />;
  return <DateTileCard event={event} />;
}

// ---------------------------------------------------------------- A: Datumbricka
// Klassiskt kalenderkort: en stor datumbricka till vänster, texten till höger, och detaljerna fälls ut under.
function DateTileCard({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const category = categoryOf(event);
  const tile = dateTile(event);
  return (
    <li className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
      <button type='button' aria-expanded={open} onClick={() => setOpen(!open)} className='flex w-full gap-4 p-4 text-left'>
        <div
          className={`flex w-16 shrink-0 flex-col items-center rounded-lg py-2 ${tile.highlight ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-900'}`}
        >
          <span className='text-sm font-semibold'>{tile.label}</span>
          <span className='text-3xl leading-none font-bold'>{tile.day}</span>
          <span className='text-sm'>{tile.month}</span>
        </div>
        <div className='min-w-0 flex-1'>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${category.badgeClass}`}>{category.label}</span>
          <h3 className='mt-1 text-xl leading-snug font-bold text-slate-900'>{event.title}</h3>
          <p className='mt-1 text-slate-700'>{timeText(event)}</p>
          {event.location && <p className='text-slate-600'>{shortPlace(event.location)}</p>}
          {event.series && <p className='mt-1 text-sm font-medium text-emerald-800'>{event.series.rule}</p>}
        </div>
        <ChevronDown aria-hidden className={`mt-1 size-6 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className='border-t border-slate-100 px-4 pt-3 pb-4'>
          <Details event={event} />
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------- B: Agenda
// Kompakt lista som en agenda: dagen och tiden i en smal kolumn, kategorin som en färgad kant, ingen bricka.
function AgendaRow({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const category = categoryOf(event);
  const tile = dateTile(event);
  return (
    <li className={`border-l-4 bg-white ${category.borderClass} border-y border-r border-y-slate-200 border-r-slate-200`}>
      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className='grid w-full grid-cols-[5.5rem_1fr] gap-3 px-3 py-3 text-left'
      >
        <div className='text-slate-700'>
          <div className={`font-semibold ${tile.highlight ? 'text-emerald-800' : ''}`}>
            {tile.highlight ? tile.label : `${tile.label} ${tile.day}`}
          </div>
          <div className='text-base'>{agendaTime(event)}</div>
        </div>
        <div className='min-w-0'>
          <h3 className='text-lg leading-snug font-semibold text-slate-900'>{event.title}</h3>
          <p className='text-base text-slate-600'>
            {[category.label, event.location && shortPlace(event.location), event.series?.rule].filter(Boolean).join(' · ')}
          </p>
        </div>
      </button>
      {open && (
        <div className='px-3 pb-4 sm:pl-[6.25rem]'>
          <Details event={event} />
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------- C: Färgband
// Stort kort med kategorin som ett färgat band överst, ikoner för tid och plats och en tydlig "Visa mer".
function BandCard({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const category = categoryOf(event);
  const tile = dateTile(event);
  return (
    <li className='overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200'>
      <div className={`flex items-center justify-between px-4 py-2 text-base font-semibold ${category.badgeClass}`}>
        <span>
          {category.emoji ? `${category.emoji} ` : ''}
          {category.label}
        </span>
        {tile.highlight && <span className='rounded-full bg-emerald-800 px-3 py-0.5 text-sm text-white'>{tile.label}</span>}
      </div>
      <div className='p-4'>
        <h3 className='text-2xl leading-snug font-bold text-slate-900'>{event.title}</h3>
        <ul className='mt-3 space-y-1.5 text-slate-700'>
          <IconLine icon={<CalendarDays className='size-5' />}>{longDate(event)}</IconLine>
          <IconLine icon={<Clock className='size-5' />}>{timeText(event)}</IconLine>
          {event.location && <IconLine icon={<MapPin className='size-5' />}>{shortPlace(event.location)}</IconLine>}
          {event.series && <IconLine icon={<Repeat className='size-5' />}>{event.series.rule}</IconLine>}
        </ul>
        <button
          type='button'
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-800 py-2.5 font-semibold text-emerald-800'
        >
          {open ? 'Visa mindre' : 'Visa mer'}
          <ChevronDown aria-hidden className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className='mt-4'>
            <Details event={event} />
          </div>
        )}
      </div>
    </li>
  );
}

function IconLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className='flex items-center gap-2'>
      <span className='text-emerald-800'>{icon}</span>
      {children}
    </li>
  );
}

// ---------------------------------------------------------------- D: Som Gemini
// Efter Andrés Gemini-skiss: liten datumruta, bricka, titel, tid och plats på en rad och en rad av beskrivningen.
// Utfällt: hela beskrivningen, arrangören till vänster och "Spara i min kalender" till höger.
function GeminiCard({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const category = categoryOf(event);
  const tile = dateTile(event);
  return (
    <li className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${open ? 'border-emerald-300' : 'border-slate-200'}`}>
      <button type='button' aria-expanded={open} onClick={() => setOpen(!open)} className='flex w-full gap-4 p-4 text-left'>
        <div
          className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border ${
            tile.highlight ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <span className={`text-[11px] font-semibold tracking-tight uppercase ${tile.highlight ? '' : 'text-slate-500'}`}>{tile.label}</span>
          <span className='text-2xl leading-tight font-bold'>{tile.day}</span>
        </div>
        <div className='min-w-0 flex-1'>
          <span className={`inline-block rounded-md px-2 py-0.5 text-sm font-medium ${category.badgeClass}`}>{category.label}</span>
          <h3 className='mt-1 text-lg leading-snug font-bold text-slate-900'>{event.title}</h3>
          <p className='mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-600'>
            <span className='inline-flex items-center gap-1.5'>
              <Clock aria-hidden className='size-4' />
              {timeText(event)}
            </span>
            {event.location && (
              <span className='inline-flex items-center gap-1.5'>
                <MapPin aria-hidden className='size-4' />
                {shortPlace(event.location)}
              </span>
            )}
            {event.series && (
              <span className='inline-flex items-center gap-1.5'>
                <Repeat aria-hidden className='size-4' />
                {event.series.rule}
              </span>
            )}
          </p>
          {!open && event.description && <p className='mt-1 line-clamp-1 text-base text-slate-500'>{event.description.split(/\n/)[0]}</p>}
        </div>
        {open ? (
          <ChevronDown aria-hidden className='size-5 shrink-0 text-slate-400' />
        ) : (
          <ChevronRight aria-hidden className='size-5 shrink-0 text-slate-400' />
        )}
      </button>
      {open && (
        <div className='mx-4 border-t border-slate-100 pt-3 pb-4 sm:ml-[6rem]'>
          <div className='space-y-3 text-slate-800'>
            {event.description && <p className='whitespace-pre-line'>{linkify(event.description)}</p>}
            {event.location && event.location !== shortPlace(event.location) && <p className='text-slate-600'>{event.location}</p>}
            {event.series && <p className='text-slate-600'>Även {listDates(event.series.later.slice(0, 3).map(timingDay))}.</p>}
          </div>
          <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-base text-slate-500'>
              {event.organizer && (
                <>
                  Arrangör: <span className='font-semibold text-slate-800'>{event.organizer}</span>
                </>
              )}
            </p>
            <span className='inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-base font-semibold text-white'>
              <CalendarPlus aria-hidden className='size-5' />
              Spara i min kalender
            </span>
          </div>
        </div>
      )}
    </li>
  );
}

// Månadsrubriken i Gemini-skissen: en grön pill med versaler och en linje till höger.
export function GeminiMonthHeading({ id, title }: { id: string; title: string }) {
  return (
    <div className='mb-4 flex items-center gap-3'>
      <h2
        id={id}
        className='rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold tracking-wider text-emerald-800 uppercase'
      >
        {title}
      </h2>
      <span aria-hidden className='h-px flex-1 bg-slate-200' />
    </div>
  );
}

// ---------------------------------------------------------------- Gemensamt för alla tre
function Details({ event }: { event: CalendarEvent }) {
  return (
    <div className='space-y-3 text-slate-800'>
      {event.description && <p className='whitespace-pre-line'>{linkify(event.description)}</p>}
      {event.location && event.location !== shortPlace(event.location) && (
        <p className='flex items-start gap-2 text-slate-600'>
          <MapPin aria-hidden className='mt-1 size-5 shrink-0' />
          {event.location}
        </p>
      )}
      {event.series && event.series.later.length > 0 && (
        <p className='text-slate-600'>Även {listDates(event.series.later.slice(0, 3).map(timingDay))}.</p>
      )}
      {event.organizer && (
        <p className='flex items-center gap-2 text-slate-600'>
          <User aria-hidden className='size-5' />
          Arrangör: {event.organizer}
        </p>
      )}
      <div className='flex flex-wrap gap-2 pt-1'>
        <span className='rounded-lg border border-dashed border-slate-300 px-3 py-2 text-base text-slate-400'>Karta (epic 4)</span>
        <span className='rounded-lg border border-dashed border-slate-300 px-3 py-2 text-base text-slate-400'>Lägg till i min kalender (epic 4)</span>
      </div>
    </div>
  );
}

const CATEGORY_BORDERS: Record<string, string> = {
  fika: 'border-l-amber-400',
  natur: 'border-l-emerald-500',
  loppis: 'border-l-purple-400',
  moten: 'border-l-blue-400',
  idrott: 'border-l-rose-400',
  ovrigt: 'border-l-slate-400',
};

function categoryOf(event: CalendarEvent) {
  const category = CATEGORIES.find((c) => c.id === event.category) ?? CATEGORIES.at(-1)!;
  return { ...category, borderClass: CATEGORY_BORDERS[category.id] };
}

const weekday = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat('sv-SE', { month: 'short', timeZone: 'UTC' });
const longDateFormat = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const clock = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' });

function dateTile(event: CalendarEvent) {
  const day = startDay(event);
  const today = toStockholmDate(new Date());
  const now = new Date();
  const ongoing = event.allDay ? event.startDate < today && event.endDate >= today : event.start <= now && event.end > now;
  const label = ongoing
    ? 'Pågår'
    : day === today
      ? 'Idag'
      : day === addDays(today, 1)
        ? 'Imorgon'
        : weekday.format(new Date(`${day}T12:00:00Z`)).replace('.', '');
  return {
    label,
    highlight: ongoing || day === today || day === addDays(today, 1),
    day: Number(day.slice(8, 10)),
    month: monthShort.format(new Date(`${day}T12:00:00Z`)).replace('.', ''),
  };
}

function timeText(event: CalendarEvent): string {
  if (event.allDay) {
    if (event.startDate === event.endDate) return 'Heldag';
    return `${dayRange(event.startDate, event.endDate)}`;
  }
  return `${clock.format(event.start)}–${clock.format(event.end)}`;
}

function agendaTime(event: CalendarEvent): string {
  if (event.allDay) return event.startDate === event.endDate ? 'Heldag' : `t.o.m. ${shortDate(event.endDate)}`;
  return clock.format(event.start);
}

function longDate(event: CalendarEvent): string {
  const text = longDateFormat.format(new Date(`${startDay(event)}T12:00:00Z`));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function dayRange(start: string, end: string): string {
  return start.slice(0, 7) === end.slice(0, 7) ? `${Number(start.slice(8))}–${shortDate(end)}` : `${shortDate(start)}–${shortDate(end)}`;
}

function shortPlace(location: string): string {
  return location.split(',')[0].trim();
}

function timingDay(timing: EventTiming): string {
  return shortDate(timing.allDay ? timing.startDate : toStockholmDate(timing.start));
}

function listDates(dates: string[]): string {
  return dates.length < 2 ? dates.join('') : `${dates.slice(0, -1).join(', ')} och ${dates.at(-1)}`;
}

// Snabb länkning för prototypen. Den riktiga, med facit för telefonnummer, byggs i utils/ i #12.
function linkify(text: string): ReactNode[] {
  const pattern = /(https?:\/\/[^\s)]+|www\.[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+|(?:\+46|0)[\d -]{7,14}\d)/g;
  return text.split(pattern).map((part, index) => {
    if (index % 2 === 0) return part;
    const href = part.includes('@')
      ? `mailto:${part}`
      : /^[+\d]/.test(part)
        ? `tel:${part.replace(/[ -]/g, '')}`
        : part.startsWith('www.')
          ? `https://${part}`
          : part;
    return (
      <a key={index} href={href} className='font-medium text-emerald-800 underline underline-offset-2'>
        {part}
      </a>
    );
  });
}
