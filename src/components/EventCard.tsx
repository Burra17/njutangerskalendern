import { ChevronDown, ChevronRight, Clock, MapPin, Repeat } from 'lucide-react';
import { useId, useState } from 'react';
import type { CalendarEvent } from '../types/calendar';
import { categoryById } from '../utils/categoryParser';
import { alsoOn, cardTitle, dateBadge, firstLine, shortPlace, timeRange, type DateBadge } from '../utils/eventFormat';
import EventActions from './EventActions';
import LinkedText from './LinkedText';

const BADGE_STYLES: Record<DateBadge['level'], { box: string; label: string }> = {
  strong: { box: 'border-emerald-800 bg-emerald-800 text-white', label: '' },
  soft: { box: 'border-emerald-600 bg-emerald-50 text-emerald-900', label: 'text-emerald-800' },
  normal: { box: 'border-slate-200 bg-slate-50 text-slate-900', label: 'text-slate-500' },
};

export default function EventCard({ event, now }: { event: CalendarEvent; now: Date }) {
  const [open, setOpen] = useState(false);
  const category = categoryById(event.category);
  const badgeEmoji = event.categoryEmoji ?? category.emoji;
  const titleId = useId();
  const metaId = useId();
  const badge = dateBadge(event, now);
  const badgeStyle = BADGE_STYLES[badge.level];
  const fullPlaceDiffers = event.location && event.location !== shortPlace(event.location);

  return (
    <li className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${open ? 'border-emerald-300' : 'border-slate-200'}`}>
      {/* Namnet är bara titeln, och tid och plats blir beskrivning, så att skärmläsaren inte läser hela kortet som namn. */}
      <button
        type='button'
        aria-expanded={open}
        aria-labelledby={titleId}
        aria-describedby={metaId}
        onClick={() => setOpen(!open)}
        className='flex w-full gap-4 rounded-xl p-4 text-left'
      >
        <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border ${badgeStyle.box}`}>
          <span className={`text-[11px] font-semibold tracking-tight uppercase ${badgeStyle.label}`}>{badge.label}</span>
          <span className='text-2xl leading-tight font-bold'>{badge.day}</span>
        </div>
        <div className='min-w-0 flex-1'>
          <span className={`inline-block rounded-md px-2 py-0.5 text-sm font-medium ${category.badgeClass}`}>
            {badgeEmoji && <span aria-hidden>{badgeEmoji} </span>}
            {category.label}
          </span>
          <h3 id={titleId} className='mt-1 text-lg leading-snug font-bold text-slate-900'>
            {cardTitle(event)}
          </h3>
          <p id={metaId} className='mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-600'>
            <IconText icon={Clock} text={timeRange(event)} />
            {event.location && <IconText icon={MapPin} text={shortPlace(event.location)} />}
            {event.series && <IconText icon={Repeat} text={event.series.rule} />}
          </p>
          {!open && event.description && <p className='mt-1 line-clamp-1 text-base text-slate-500'>{firstLine(event.description)}</p>}
        </div>
        {open ? (
          <ChevronDown aria-hidden className='size-5 shrink-0 text-slate-400' />
        ) : (
          <ChevronRight aria-hidden className='size-5 shrink-0 text-slate-400' />
        )}
      </button>

      {open && (
        <div className='mx-4 border-t border-slate-100 pt-3 pb-4 sm:ml-24'>
          <div className='space-y-3 text-slate-800'>
            {event.description && (
              <p className='whitespace-pre-line'>
                <LinkedText text={event.description} />
              </p>
            )}
            {fullPlaceDiffers && <p className='text-slate-600'>{event.location}</p>}
            {event.series && <p className='text-slate-600'>{alsoOn(event.series.later)}</p>}
          </div>
          <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
            {event.organizer && (
              <p className='text-base text-slate-500'>
                Arrangör: <span className='font-semibold text-slate-800'>{event.organizer}</span>
              </p>
            )}
            <EventActions event={event} now={now} />
          </div>
        </div>
      )}
    </li>
  );
}

function IconText({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <span className='inline-flex items-center gap-1.5'>
      <Icon aria-hidden className='size-4 shrink-0' />
      {text}
    </span>
  );
}
