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

// Byn bakom texten: klockstapeln och kyrkan, en gård med stuga och ladugård, björkar och granskog (beslut i #49).
// Kyrkans vita väggar står under textraden, så att den vita texten aldrig hamnar mot vitt. Mitten är det mobilen visar.
function VillageSilhouette() {
  return (
    <>
      <svg aria-hidden viewBox='0 0 1200 116' preserveAspectRatio='xMidYMin slice' className='absolute inset-0 h-full w-full'>
        <g fill='#ffffff' opacity='0.08'>
          <ellipse cx='300' cy='26' rx='46' ry='9' />
          <ellipse cx='330' cy='20' rx='26' ry='9' />
          <ellipse cx='760' cy='18' rx='54' ry='9' />
          <ellipse cx='790' cy='12' rx='28' ry='8' />
          <ellipse cx='1060' cy='30' rx='40' ry='8' />
        </g>
      </svg>
      <svg aria-hidden viewBox='0 0 1200 90' preserveAspectRatio='xMidYMax slice' className='absolute inset-x-0 bottom-0 h-[72px] w-full lg:h-[84px]'>
        <path
          fill='#074a38'
          d='M0 68 L-10 68 L1 52 L13 68 L10 68 L19 54 L28 68 L32 68 L41 45 L51 68 L46 68 L59 50 L72 68 L60 68 L69 43 L79 68 L80 68 L89 49 L99 68 L95 68 L108 43 L121 68 L109 68 L118 49 L128 68 L123 68 L135 55 L147 68 L140 68 L149 52 L158 68 L158 68 L170 52 L182 68 L180 68 L189 47 L199 68 L202 68 L212 53 L222 68 L219 68 L230 53 L242 68 L241 68 L250 55 L260 68 L258 68 L270 43 L283 68 L277 68 L289 42 L302 68 L296 68 L307 49 L318 68 L312 68 L322 54 L333 68 L330 68 L343 41 L356 68 L349 68 L361 47 L374 68 L364 68 L373 40 L383 68 L384 68 L394 46 L404 68 L400 68 L412 43 L425 68 L414 68 L423 46 L433 68 L433 68 L444 41 L456 68 L454 68 L463 54 L473 68 L472 68 L484 54 L497 68 L486 68 L497 42 L508 68 L504 68 L516 45 L528 68 L518 68 L530 45 L543 68 L534 68 L543 41 L553 68 L548 68 L558 47 L569 68 L564 68 L574 44 L585 68 L584 68 L596 54 L609 68 L600 68 L612 44 L625 68 L622 68 L633 52 L644 68 L642 68 L655 48 L668 68 L662 68 L673 44 L685 68 L679 68 L689 54 L699 68 L695 68 L705 49 L715 68 L712 68 L721 41 L730 68 L728 68 L739 47 L750 68 L742 68 L752 43 L762 68 L764 68 L775 46 L787 68 L780 68 L793 55 L806 68 L801 68 L814 44 L827 68 L821 68 L833 44 L845 68 L836 68 L848 44 L861 68 L850 68 L860 54 L871 68 L867 68 L879 51 L892 68 L882 68 L893 55 L905 68 L897 68 L906 52 L915 68 L919 68 L928 45 L938 68 L933 68 L942 50 L952 68 L953 68 L963 48 L973 68 L972 68 L983 41 L995 68 L987 68 L996 41 L1006 68 L1008 68 L1020 41 L1033 68 L1026 68 L1035 52 L1045 68 L1041 68 L1052 48 L1064 68 L1062 68 L1072 40 L1082 68 L1076 68 L1086 40 L1097 68 L1095 68 L1105 56 L1115 68 L1117 68 L1128 54 L1139 68 L1135 68 L1148 45 L1161 68 L1151 68 L1162 49 L1174 68 L1173 68 L1186 40 L1199 68 L1192 68 L1202 50 L1213 68 L1209 68 L1221 49 L1233 68 L1200 68 L1200 90 L0 90 Z'
        />
        {/* Kullen med klockstapeln. */}
        <path fill='#085440' d='M340 82 Q420 50 520 82 Z' />
        <g>
          <path d='M418 62 L442 62 L437 44 L423 44 Z' fill='#4a2f22' />
          <path d='M424 62 L430 50 L436 62 Z' fill='#0b5a45' />
          <rect x='421' y='36' width='18' height='8' fill='#5b3a29' />
          <path d='M416 37 Q430 22 444 37 Z' fill='#3b2418' />
          <rect x='427' y='22' width='6' height='5' fill='#5b3a29' />
          <path d='M425 23 Q430 15 435 23 Z' fill='#3b2418' />
          <rect x='429.4' y='9' width='1.2' height='8' fill='#3b2418' />
          <rect x='427.5' y='11' width='5' height='1.2' fill='#3b2418' />
        </g>
        {/* Kyrkan: vitt långhus med brunt valmat tak, rundbågade fönster och vapenhus på gaveln. */}
        <g>
          <path d='M500 60 L626 60 L612 46 L514 46 Z' fill='#3f2a20' />
          <rect x='504' y='60' width='118' height='22' fill='#f1f5f9' />
          <rect x='486' y='66' width='18' height='16' fill='#e2e8f0' />
          <path d='M483 67 L495 58 L507 67 Z' fill='#3f2a20' />
          <g fill='#24433b'>
            <rect x='520' y='65' width='6' height='10' rx='3' />
            <rect x='546' y='65' width='6' height='10' rx='3' />
            <rect x='572' y='65' width='6' height='10' rx='3' />
            <rect x='598' y='65' width='6' height='10' rx='3' />
          </g>
          <rect x='519' y='38' width='1.2' height='8' fill='#3f2a20' />
          <rect x='517' y='40' width='5' height='1.2' fill='#3f2a20' />
        </g>
        <rect x='647' y='58' width='2.5' height='22' fill='#e2e8f0' />
        <ellipse cx='648' cy='51' rx='11' ry='14' fill='#0b6b50' />
        {/* Gården: röd stuga och röd ladugård med vita knutar. */}
        <g>
          <path d='M668 66 L697 50 L726 66 Z' fill='#4a1d17' />
          <rect x='672' y='64' width='50' height='18' fill='#9b2d20' />
          <rect x='672' y='64' width='3' height='18' fill='#f8fafc' />
          <rect x='719' y='64' width='3' height='18' fill='#f8fafc' />
          <rect x='692' y='70' width='9' height='12' fill='#f8fafc' />
          <path d='M732 62 L742 52 L773 46 L804 52 L814 62 Z' fill='#4a1d17' />
          <rect x='736' y='60' width='74' height='22' fill='#8a2a1d' />
          <rect x='736' y='60' width='3' height='22' fill='#f8fafc' />
          <rect x='807' y='60' width='3' height='22' fill='#f8fafc' />
          <rect x='762' y='67' width='22' height='15' fill='#5c1d14' stroke='#f8fafc' strokeWidth='1.5' />
        </g>
        <rect x='829' y='62' width='2.5' height='20' fill='#e2e8f0' />
        <ellipse cx='830' cy='56' rx='10' ry='13' fill='#0b6b50' />
        <rect x='199' y='62' width='2.5' height='18' fill='#e2e8f0' />
        <ellipse cx='200' cy='57' rx='9' ry='12' fill='#0b6b50' />
        <rect x='984' y='60' width='2.5' height='20' fill='#e2e8f0' />
        <ellipse cx='985' cy='54' rx='10' ry='13' fill='#0b6b50' />
        {/* Ett avlägset hus, som bara syns på desktop. */}
        <g>
          <path d='M1058 70 L1072 62 L1086 70 Z' fill='#4a1d17' />
          <rect x='1060' y='69' width='24' height='11' fill='#9b2d20' />
        </g>
        <path
          fill='#063a2d'
          d='M0 82 L-10 82 L2 65 L14 82 L11 82 L19 72 L27 82 L39 82 L49 65 L59 82 L59 82 L68 61 L78 82 L84 82 L94 65 L105 82 L112 82 L122 67 L133 82 L129 82 L138 71 L148 82 L148 82 L159 69 L171 82 L169 82 L178 65 L188 82 L194 82 L202 65 L210 82 L220 82 L230 60 L241 82 L246 82 L254 59 L263 82 L272 82 L280 58 L289 82 L294 82 L303 65 L313 82 L312 82 L323 60 L334 82 L338 82 L348 71 L359 82 L388 82 L406 82 L422 82 L445 82 L470 82 L491 82 L515 82 L531 82 L558 82 L577 82 L597 82 L621 82 L646 82 L670 82 L688 82 L715 82 L738 82 L762 82 L780 82 L796 82 L814 82 L842 82 L860 82 L860 82 L871 63 L883 82 L887 82 L895 64 L904 82 L903 82 L913 62 L924 82 L927 82 L939 64 L951 82 L950 82 L958 58 L967 82 L974 82 L982 69 L990 82 L993 82 L1003 72 L1013 82 L1021 82 L1029 64 L1038 82 L1044 82 L1056 72 L1068 82 L1072 82 L1080 65 L1089 82 L1093 82 L1105 63 L1117 82 L1117 82 L1126 61 L1136 82 L1137 82 L1148 64 L1160 82 L1161 82 L1172 64 L1184 82 L1180 82 L1192 58 L1204 82 L1200 82 L1212 58 L1224 82 L1200 82 L1200 90 L0 90 Z'
        />
        <path fill='#063a2d' d='M0 82 Q300 78 600 82 T1200 80 L1200 90 L0 90 Z' />
      </svg>
    </>
  );
}
