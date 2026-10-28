import { CalendarSync } from 'lucide-react';
import { useState } from 'react';
import { calendarTarget } from '../utils/calendarLinks';
import { subscriptionLinks } from '../utils/subscriptionLinks';

const BUTTON = 'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold';
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };
const SMALL = 'text-sm text-slate-600';
const SMALL_LINK = `${SMALL} py-1 underline underline-offset-2 hover:text-slate-900`;

type CopyState = 'idle' | 'copied' | 'failed';

// calendarId är null i demoläget. Knappen syns ändå, så att layouten är densamma som med den riktiga kalendern.
export default function SubscribeButton({ calendarId }: { calendarId: string | null }) {
  const [copy, setCopy] = useState<CopyState>('idle');
  const label = (
    <>
      <CalendarSync aria-hidden className='size-5' />
      Synka hela kalendern till mobilen
    </>
  );

  if (!calendarId) {
    return (
      <div className='space-y-2 text-center'>
        <button type='button' disabled className={`${BUTTON} cursor-not-allowed bg-slate-200 text-slate-500`}>
          {label}
        </button>
        <p className={SMALL}>Fungerar när den riktiga kalendern är kopplad.</p>
      </div>
    );
  }

  const links = subscriptionLinks(calendarId);
  // Allt utom 'google' är iPhone, iPad och Safari på Mac, som öppnar webcal i Kalender-appen. Övriga får Googles länk, där nya händelser kommer fram inom minuter (#17).
  const opensWebcal = calendarTarget(navigator.userAgent) !== 'google';

  function copyAddress() {
    // Utan https finns inget navigator.clipboard alls.
    const written = navigator.clipboard?.writeText(links.https) ?? Promise.reject(new Error('Urklippet saknas'));
    written.then(
      () => setCopy('copied'),
      () => setCopy('failed'),
    );
  }

  return (
    <div className='space-y-2 text-center'>
      <a
        href={opensWebcal ? links.webcal : links.google}
        {...(opensWebcal ? {} : NEW_TAB)}
        className={`${BUTTON} bg-emerald-800 text-white hover:bg-emerald-900`}
      >
        {label}
      </a>
      <p className={SMALL}>Nya händelser dyker upp i din kalender av sig själva.</p>
      {opensWebcal ? (
        <a href={links.google} {...NEW_TAB} className={SMALL_LINK}>
          Använder du Google Kalender?
        </a>
      ) : (
        <button type='button' onClick={copyAddress} className={SMALL_LINK}>
          {copy === 'copied' ? 'Kopierad!' : 'Annan kalender? Kopiera adressen'}
        </button>
      )}
      {/* Utan urklipp, till exempel i en gammal webbläsare, visas adressen så att den går att markera och kopiera för hand. */}
      {copy === 'failed' && <p className='text-sm break-all text-slate-800 select-all'>{links.https}</p>}
    </div>
  );
}
