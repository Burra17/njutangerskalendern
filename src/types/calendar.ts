// Ett datum utan tid, 'YYYY-MM-DD'. Heldagar hålls som sådana hela vägen, så att de aldrig hamnar på fel dag.
export type IsoDate = string;

// Det Google Calendar API skickar för en händelse. Bara fälten appen använder.
export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GoogleEventTime;
  end: GoogleEventTime;
};

// Heldagar har date, tidsatta händelser har dateTime med tidszonsförskjutning. Heldagens end är exklusivt.
export type GoogleEventTime = { date: IsoDate } | { dateTime: string; timeZone?: string };

export type CategoryId = 'fika' | 'natur' | 'loppis' | 'moten' | 'idrott' | 'ovrigt';

// Det appen använder för en händelse.
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  organizer?: string;
  category: CategoryId;
} & EventTiming;

// endDate är heldagens sista dag, till skillnad från Googles exklusiva slutdatum.
export type EventTiming = { allDay: true; startDate: IsoDate; endDate: IsoDate } | { allDay: false; start: Date; end: Date };
