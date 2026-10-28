import { CalendarPlus, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import { calendarTarget, googleCalendarUrl, icsFile, icsFileName, mapsUrl } from '../utils/calendarLinks';

const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold';
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };
const PRIMARY = `${BUTTON} bg-emerald-800 text-white hover:bg-emerald-900`;
const SMALL = 'py-1 text-sm text-slate-600';
const SMALL_LINK = `${SMALL} underline underline-offset-2 hover:text-slate-900`;

// En knapp som gissar kalendern utifrån enheten, och en liten länk till det andra valet för den som fick fel gissning (beslut i #16).
export default function EventActions({ event, now }: { event: CalendarEvent; now: Date }) {
  const target = calendarTarget(navigator.userAgent);
  const ics = useIcsLink(event, now);
  const google = { href: googleCalendarUrl(event), ...NEW_TAB };
  const label = (
    <>
      <CalendarPlus aria-hidden className='size-5' />
      Lägg till i kalendern
    </>
  );

  return (
    <div className='flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-start'>
      {event.location && (
        <a href={mapsUrl(event.location)} {...NEW_TAB} className={`${BUTTON} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}>
          <MapPin aria-hidden className='size-5' />
          Visa på karta
        </a>
      )}
      <div className='flex flex-col gap-1 text-center'>
        {target === 'ics' ? (
          <>
            <a {...ics} className={PRIMARY}>
              {label}
            </a>
            <a {...google} className={SMALL_LINK}>
              Använder du Google Kalender?
            </a>
          </>
        ) : (
          <>
            <a {...google} className={PRIMARY}>
              {label}
            </a>
            {target === 'googleOnIos' ? (
              <p className={SMALL}>Vill du ha den i iPhones kalender? Öppna sidan i Safari.</p>
            ) : (
              <a {...ics} className={SMALL_LINK}>
                Annan kalender? Ladda ner fil
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Safari på iPhone öppnar en .ics från en Blob-länk men inte från en data-URL (testat i #16). Blobben släpps när kortet fälls ihop.
function useIcsLink(event: CalendarEvent, now: Date) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([icsFile(event, now)], { type: 'text/calendar;charset=utf-8' }));
    if (ref.current) ref.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [event, now]);
  return { ref, download: icsFileName(event.title) };
}
