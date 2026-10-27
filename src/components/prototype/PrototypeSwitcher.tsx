// PROTOTYP för #12. Flytande växlare mellan varianterna. Visas bara i utvecklingsläge.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { VARIANTS, type VariantKey } from './EventCardVariants';

const KEYS = Object.keys(VARIANTS) as VariantKey[];

export function readVariant(): VariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  return KEYS.includes(value as VariantKey) ? (value as VariantKey) : 'A';
}

export default function PrototypeSwitcher({ current, onChange }: { current: VariantKey; onChange: (key: VariantKey) => void }) {
  const step = (delta: number) => {
    const next = KEYS[(KEYS.indexOf(current) + delta + KEYS.length) % KEYS.length];
    const url = new URL(window.location.href);
    url.searchParams.set('variant', next);
    window.history.replaceState(null, '', url);
    onChange(next);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable]')) return;
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!import.meta.env.DEV) return null;
  return (
    <div className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-fuchsia-700 px-2 py-1.5 text-base font-semibold text-white shadow-xl'>
      <button type='button' aria-label='Föregående variant' onClick={() => step(-1)} className='rounded-full p-1.5 hover:bg-fuchsia-800'>
        <ChevronLeft className='size-5' />
      </button>
      <span className='px-2 whitespace-nowrap'>
        {current} ({VARIANTS[current]})
      </span>
      <button type='button' aria-label='Nästa variant' onClick={() => step(1)} className='rounded-full p-1.5 hover:bg-fuchsia-800'>
        <ChevronRight className='size-5' />
      </button>
    </div>
  );
}
