import { villageConfig } from '../config/villageConfig';

export default function Header() {
  return (
    <header className='bg-emerald-800 text-white'>
      <div className='mx-auto max-w-6xl px-4 py-6'>
        <h1 className='text-3xl font-bold tracking-tight'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100'>{villageConfig.tagline}</p>
      </div>
    </header>
  );
}
