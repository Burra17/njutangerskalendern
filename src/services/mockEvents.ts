import type { GoogleCalendarEvent, GoogleEventTime, IsoDate } from '../types/calendar';
import { addDays, STOCKHOLM, stockholmOffset, toStockholmDate } from '../utils/dates';

// Påhittade händelser i Googles format, med datum från idag, så att demoläget aldrig blir tomt och går genom samma omvandling som riktiga.
export function createMockEvents(now = new Date()): GoogleCalendarEvent[] {
  const today = toStockholmDate(now);

  const timed = (daysFromToday: number, from: string, to: string): Pick<GoogleCalendarEvent, 'start' | 'end'> => {
    const day = addDays(today, daysFromToday);
    return { start: stockholmTime(day, from), end: stockholmTime(day, to) };
  };

  const allDay = (daysFromToday: number, days = 1): Pick<GoogleCalendarEvent, 'start' | 'end'> => ({
    start: { date: addDays(today, daysFromToday) },
    end: { date: addDays(today, daysFromToday + days) },
  });

  // Telefonnumren kommer från PTS serie för fiktion, så att ingen riktig person blir uppringd.
  return [
    {
      id: 'mock-1',
      summary: '☕ Förmiddagsfika i bygdegården',
      description: 'Kaffe, bullar och prat. Alla är välkomna, ingen anmälan behövs.\nArrangör: Fikagruppen',
      location: 'Bygdegården',
      ...timed(0, '10:00', '11:30'),
    },
    {
      id: 'mock-2',
      summary: '📋 Styrelsemöte',
      description:
        'Dagordning:<br>1. Ekonomi<br>2. Byfesten<br><br><a href="https://example.com/dagordning">Hela dagordningen</a> &amp; förra protokollet finns på nätet.',
      location: 'Bygdegården, lilla salen',
      ...timed(2, '18:00', '20:00'),
    },
    {
      id: 'mock-3',
      summary: '🧹 Städdag vid badplatsen',
      description: 'Ta med kratta och arbetshandskar. Korv bjuds på efteråt.\nArrangör: Badplatsgruppen',
      location: 'Badplatsen',
      ...allDay(5),
    },
    {
      id: 'mock-4',
      summary: '🏷️ Loppis på skolgården',
      description: 'Vill du ha ett bord? Ring 070-174 06 05 eller mejla loppis@example.com.',
      location: 'Skolan',
      ...timed(9, '10:00', '14:00'),
    },
    {
      id: 'mock-5',
      summary: '⚽ Fotbollsträning för barn',
      description: 'För barn 6–12 år. Ta med vattenflaska.',
      location: 'Idrottsplatsen',
      ...timed(12, '17:30', '18:30'),
    },
    {
      id: 'mock-6',
      summary: 'Bastukväll',
      description: 'Damer 18–19:30, herrar 19:30–21. Handduk finns att låna.',
      location: 'Bastun vid badplatsen',
      ...timed(16, '18:00', '21:00'),
    },
    {
      id: 'mock-7',
      summary: 'Årsmöte med fika',
      description: 'Val av styrelse och genomgång av året. Fika serveras efter mötet.',
      location: 'Bygdegården',
      ...timed(20, '18:30', '20:00'),
    },
    {
      id: 'mock-8',
      summary: '🎉 Byfest',
      description:
        'Tre dagar med musik, tipspromenad och grill.\nFredag: dans från 19\nLördag: marknad och tävlingar\nSöndag: gudstjänst och korvgrillning',
      location: 'Bygdegården',
      ...allDay(27, 3),
    },
    {
      id: 'mock-9',
      summary: 'Vandring längs ån',
      description: '<p>Ungefär 8 km i lugnt tempo.</p><p>Ta med matsäck.</p>',
      location: 'Samling vid kyrkan',
      ...timed(35, '10:00', '13:00'),
    },
    {
      id: 'mock-10',
      summary: 'Bokcirkel',
      description: 'Vi pratar om månadens bok. Nya läsare är välkomna, mejla bokcirkel@example.com.',
      location: 'Biblioteket',
      ...timed(44, '19:00', '20:30'),
    },
    {
      id: 'mock-11',
      summary: 'Auktion i bygdegården',
      description: 'Visning från kl. 11. Kontant eller Swish.\nArrangör: Auktionsgruppen',
      location: 'Bygdegården',
      ...timed(52, '12:00', '15:00'),
    },
    {
      id: 'mock-12',
      summary: 'Planeringsmöte för hantverksmarknaden',
      description: 'Vi ses digitalt: https://example.com/mote\nFrågor? Ring 070-174 06 99.',
      ...timed(63, '19:00', '20:00'),
    },
    {
      id: 'mock-13',
      summary: '🛍️ Hantverksmarknad',
      description: 'Lokala hantverkare säljer trä, textil och keramik. Servering hela dagen.',
      location: 'Skolan',
      ...allDay(78),
    },
    // En veckoaktivitet, som Google skickar som ett tillfälle per vecka med samma recurringEventId.
    ...[1, 8, 15, 22].map((daysFromToday) => ({
      id: `mock-14_${daysFromToday}`,
      recurringEventId: 'mock-14',
      summary: 'Gympa för seniorer',
      description: 'Lugn gympa till musik. Alla nivåer är välkomna.',
      location: 'Skolans gymnastiksal',
      ...timed(daysFromToday, '10:00', '11:00'),
    })),
  ];
}

function stockholmTime(day: IsoDate, time: string): GoogleEventTime {
  return { dateTime: `${day}T${time}:00${stockholmOffset(day)}`, timeZone: STOCKHOLM };
}
