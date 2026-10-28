import { CalendarPlus, MapPin } from 'lucide-react';
import type { CalendarEvent } from '../types/calendar';
import { googleCalendarUrl, icsDataUrl, icsFileName, isAppleDevice, mapsUrl } from '../utils/calendarLinks';

const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold';
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };

// En knapp som gissar kalendern utifrån enheten, och en liten länk till det andra valet för den som fick fel gissning (beslut i #16).
export default function EventActions({ event, now }: { event: CalendarEvent; now: Date }) {
  const apple = isAppleDevice(navigator.userAgent);
  const ics = { href: icsDataUrl(event, now), download: icsFileName(event.title) };
  const google = { href: googleCalendarUrl(event), ...NEW_TAB };
  const [primary, secondary] = apple ? [ics, google] : [google, ics];

  return (
    <div className='flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-start'>
      {event.location && (
        <a href={mapsUrl(event.location)} {...NEW_TAB} className={`${BUTTON} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}>
          <MapPin aria-hidden className='size-5' />
          Visa på karta
        </a>
      )}
      <div className='flex flex-col gap-1 text-center'>
        <a {...primary} className={`${BUTTON} bg-emerald-800 text-white hover:bg-emerald-900`}>
          <CalendarPlus aria-hidden className='size-5' />
          Lägg till i kalendern
        </a>
        <a {...secondary} className='py-1 text-sm text-slate-600 underline underline-offset-2 hover:text-slate-900'>
          {apple ? 'Använder du Google Kalender?' : 'Annan kalender? Ladda ner fil'}
        </a>
      </div>
    </div>
  );
}
