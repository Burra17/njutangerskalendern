import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { villageConfig } from '../config/villageConfig';
import { suggestEventMailto } from '../utils/contactLink';
import SubscribeButton from './SubscribeButton';

// Desktop: klistrig under kategoriraden, som är upp till 105 px hög när pillren går på två rader. Mobil: under tidslinjen (beslut i #18).
export default function Sidebar({ calendarId }: { calendarId: string | null }) {
  return (
    <aside aria-label='Sidopanel' className='space-y-4 self-start lg:sticky lg:top-32'>
      <SidebarCard title='Ha byn i din egen mobil'>
        <SubscribeButton calendarId={calendarId} />
      </SidebarCard>
      <SidebarCard title='Vill du ha med något i kalendern?'>
        <p className='text-base text-slate-700'>Mejla vad, när och var, så lägger vi in det.</p>
        <a
          href={suggestEventMailto(villageConfig.contactEmail)}
          className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-slate-50'
        >
          <Mail aria-hidden className='size-5' />
          Skicka ett mejl
        </a>
        {/* Adressen syns också, för den som hellre skriver från en annan mejl. */}
        <p className='mt-2 text-center text-sm wrap-anywhere text-slate-600'>{villageConfig.contactEmail}</p>
      </SidebarCard>
    </aside>
  );
}

function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
      <h2 className='mb-3 text-lg font-bold text-slate-900'>{title}</h2>
      {children}
    </section>
  );
}
