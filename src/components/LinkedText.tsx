import { linkify } from '../utils/linkify';

// Texten från kalendern renderas som text, och länkarna byggs som riktiga <a>. Aldrig innerHTML.
export default function LinkedText({ text }: { text: string }) {
  return linkify(text).map((part, index) =>
    part.href ? (
      <a key={index} href={part.href} className='font-medium break-words text-emerald-800 underline underline-offset-2 hover:text-emerald-900'>
        {part.text}
      </a>
    ) : (
      part.text
    ),
  );
}
