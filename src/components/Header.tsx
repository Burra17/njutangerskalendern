import { villageConfig } from '../config/villageConfig';

export default function Header() {
  return (
    <header className='bg-emerald-800 text-white'>
      <div className='mx-auto max-w-6xl px-4 py-4 sm:py-6'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100'>{villageConfig.tagline}</p>
      </div>
    </header>
  );
}
