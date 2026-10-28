import { Mail } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { villageConfig } from '../config/villageConfig';
import { eventMailto } from '../utils/eventMailto';
import SubscribeButton from './SubscribeButton';

// Desktop: klistrig under kategoriraden, som är 66 px hög sedan #48. Mobil: under tidslinjen (beslut i #18).
export default function Sidebar({ calendarId }: { calendarId: string | null }) {
  return (
    <aside aria-label='Sidopanel' className='space-y-4 self-start lg:sticky lg:top-22'>
      <SidebarCard title='Ha byn i din egen mobil'>
        <SubscribeButton calendarId={calendarId} />
      </SidebarCard>
      <SidebarCard title='Vill du ha med något i kalendern?'>
        <p className='text-base text-slate-700'>Mejla vad, när, var och vem som arrangerar, så lägger vi in det.</p>
        <a
          href={eventMailto()}
          className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-slate-50'
        >
          <Mail aria-hidden className='size-5' />
          Skicka ett mejl
        </a>
        {/* Adressen syns också och markeras med ett tryck, för den som hellre skriver från en annan mejl. */}
        <p className='mt-2 text-center text-sm wrap-anywhere text-slate-600 select-all'>{villageConfig.contactEmail}</p>
      </SidebarCard>
    </aside>
  );
}

function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <h2 id={titleId} className='mb-3 text-lg font-bold text-slate-900'>
        {title}
      </h2>
      {children}
    </section>
  );
}
