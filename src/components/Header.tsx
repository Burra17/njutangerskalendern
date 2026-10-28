import { useState } from 'react';
import { villageConfig } from '../config/villageConfig';
import type { CalendarEvent } from '../types/calendar';
import { countRestOfWeek, headerDate, weekCountText } from '../utils/weekSummary';

// events är null medan kalendern laddar eller när den inte gick att hämta, och då visas bara datumet.
type Props = { events: CalendarEvent[] | null };

// Svarar på "Vad händer i byn?" med datum och veckans antal, ovanför en siluett av byn (beslut i #49).
export default function Header({ events }: Props) {
  const [now] = useState(() => new Date());
  const count = events && countRestOfWeek(events, now);

  return (
    <header className='relative overflow-hidden bg-emerald-800 text-white'>
      <div className='relative z-10 mx-auto max-w-6xl px-4 pt-5 pb-7 lg:flex lg:items-start lg:justify-between lg:pb-9'>
        <h1 className='text-3xl font-bold tracking-tight'>{villageConfig.siteName}</h1>
        <p className='mt-1 text-emerald-100 lg:hidden'>
          {headerDate(now, true)}
          {count !== null && `. ${weekCountText(count, true)}`}
        </p>
        <p className='hidden text-right text-emerald-100 lg:block'>
          <span className='block text-2xl font-bold tracking-tight text-white'>{headerDate(now)}</span> {count !== null && weekCountText(count)}
        </p>
      </div>
      <VillageSilhouette />
    </header>
  );
}

// Granskog, en röd stuga, klockstapeln och vattnet bakom texten, i mörkare grönt så att texten syns. Stugan och stapeln står mot mitten, så att mobilen inte beskär bort dem.
function VillageSilhouette() {
  return (
    <svg aria-hidden viewBox='0 0 1200 90' preserveAspectRatio='xMidYMax slice' className='absolute inset-x-0 bottom-0 h-[72px] w-full lg:h-[84px]'>
      <path fill='#085440' d='M0 62 Q150 48 300 58 T600 54 T900 58 T1200 50 L1200 90 L0 90 Z' />
      <path
        fill='#074a38'
        d='M0 70 L-10 70 L1 52 L13 70 L10 70 L19 54 L28 70 L32 70 L41 45 L51 70 L46 70 L59 50 L72 70 L60 70 L69 43 L79 70 L80 70 L89 49 L99 70 L95 70 L108 43 L121 70 L109 70 L118 49 L128 70 L123 70 L135 55 L147 70 L140 70 L149 52 L158 70 L158 70 L170 52 L182 70 L180 70 L189 47 L199 70 L202 70 L212 53 L222 70 L219 70 L230 53 L242 70 L241 70 L250 55 L260 70 L258 70 L270 43 L283 70 L277 70 L289 42 L302 70 L296 70 L307 49 L318 70 L312 70 L322 54 L333 70 L330 70 L343 41 L356 70 L349 70 L361 47 L374 70 L364 70 L373 40 L383 70 L384 70 L394 46 L404 70 L400 70 L412 43 L425 70 L414 70 L423 46 L433 70 L433 70 L444 41 L456 70 L454 70 L463 54 L473 70 L472 70 L484 54 L497 70 L486 70 L497 42 L508 70 L504 70 L516 45 L528 70 L518 70 L530 45 L543 70 L534 70 L543 41 L553 70 L548 70 L558 47 L569 70 L564 70 L574 44 L585 70 L584 70 L596 54 L609 70 L600 70 L612 44 L625 70 L622 70 L633 52 L644 70 L642 70 L655 48 L668 70 L662 70 L673 44 L685 70 L679 70 L689 54 L699 70 L695 70 L705 49 L715 70 L712 70 L721 41 L730 70 L728 70 L739 47 L750 70 L742 70 L752 43 L762 70 L764 70 L775 46 L787 70 L780 70 L793 55 L806 70 L801 70 L814 44 L827 70 L821 70 L833 44 L845 70 L836 70 L848 44 L861 70 L850 70 L860 54 L871 70 L867 70 L879 51 L892 70 L882 70 L893 55 L905 70 L897 70 L906 52 L915 70 L919 70 L928 45 L938 70 L933 70 L942 50 L952 70 L953 70 L963 48 L973 70 L972 70 L983 41 L995 70 L987 70 L996 41 L1006 70 L1008 70 L1020 41 L1033 70 L1026 70 L1035 52 L1045 70 L1041 70 L1052 48 L1064 70 L1062 70 L1072 40 L1082 70 L1076 70 L1086 40 L1097 70 L1095 70 L1105 56 L1115 70 L1117 70 L1128 54 L1139 70 L1135 70 L1148 45 L1161 70 L1151 70 L1162 49 L1174 70 L1173 70 L1186 40 L1199 70 L1192 70 L1202 50 L1213 70 L1209 70 L1221 49 L1233 70 L1200 70 L1200 90 L0 90 Z'
      />
      <g fill='#063a2d'>
        <rect x='794' y='46' width='18' height='34' />
        <path d='M789 48 L803 26 L817 48 Z' />
        <rect x='801' y='18' width='4' height='10' />
      </g>
      <path
        fill='#063a2d'
        d='M0 80 L-10 80 L2 55 L14 80 L11 80 L19 70 L27 80 L39 80 L49 55 L59 80 L59 80 L68 59 L78 80 L82 80 L92 59 L103 80 L99 80 L108 67 L118 80 L118 80 L129 64 L141 80 L139 80 L148 55 L158 80 L164 80 L172 55 L180 80 L194 80 L204 68 L215 80 L223 80 L231 58 L240 80 L251 80 L260 55 L270 80 L281 80 L290 57 L299 80 L309 80 L319 68 L330 80 L337 80 L348 56 L359 80 L359 80 L367 65 L376 80 L377 80 L386 70 L395 80 L395 80 L406 66 L418 80 L420 80 L431 59 L443 80 L438 80 L450 66 L462 80 L454 80 L462 67 L470 80 L478 80 L487 57 L496 80 L507 80 L516 64 L526 80 L523 80 L533 64 L543 80 L571 80 L595 80 L611 80 L637 80 L666 80 L666 80 L678 66 L690 80 L690 80 L699 54 L708 80 L714 80 L722 56 L730 80 L742 80 L751 70 L760 80 L770 80 L779 65 L788 80 L812 80 L838 80 L838 80 L850 54 L862 80 L862 80 L873 67 L885 80 L892 80 L904 69 L916 80 L911 80 L920 62 L930 80 L927 80 L935 54 L944 80 L950 80 L962 70 L974 80 L978 80 L986 56 L995 80 L999 80 L1011 54 L1023 80 L1018 80 L1028 56 L1038 80 L1042 80 L1054 55 L1066 80 L1066 80 L1075 54 L1085 80 L1096 80 L1106 64 L1116 80 L1125 80 L1136 66 L1148 80 L1147 80 L1155 58 L1164 80 L1170 80 L1180 68 L1191 80 L1196 80 L1205 57 L1215 80 L1200 80 L1200 90 L0 90 Z'
      />
      <g>
        <rect x='560' y='60' width='54' height='20' fill='#9b2d20' />
        <path d='M554 62 L587 44 L620 62 Z' fill='#4a1d17' />
        <rect x='560' y='60' width='3' height='20' fill='#f8fafc' />
        <rect x='611' y='60' width='3' height='20' fill='#f8fafc' />
        <rect x='582' y='67' width='10' height='13' fill='#f8fafc' />
      </g>
      <rect y='80' width='1200' height='10' fill='#0f4f5c' />
      <path d='M60 85 h40 M220 84 h60 M480 86 h30 M720 84 h50 M960 86 h40' stroke='#5eead4' strokeOpacity='0.35' strokeWidth='1.5' />
    </svg>
  );
}
