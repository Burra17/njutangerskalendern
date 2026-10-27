# Projektspecifikation: Njutångerskalendern ("Vad händer i byn?")

> Originalspecen från starten av projektet. Besluten från grillningen står i CLAUDE.md och i ticketarna och går före det som står här.

Detta dokument är en komplett teknisk specifikation och instruktion för att bygga en snabb, responsiv och underhållsfri byakalender i React. Applikationen använder en **publik Google Kalender som Headless CMS**, vilket innebär **0 kr i driftskostnad**, ingen egen databas och att administratören sköter allt direkt från sin vanliga Google Kalender-app i mobilen.

---

## 1. Projektöversikt & Mål
* **Syfte:** Visa kommande aktiviteter, möten, loppisar och fikastunder i en mindre ort/by på ett överskådligt sätt.
* **Målgrupp (Besökare):** Bybor i alla åldrar (90 % förväntas besöka sidan via mobilen).
* **Administratör:** Lägger till/redigerar händelser i sin befintliga Google Kalender-app i telefonen.
* **Driftskostnad:** 0 kr (Statisk hosting via Vercel/Netlify/GitHub Pages + Google Calendar API Free Tier).

---

## 2. Teknisk Stack
* **Ramverk:** React 18+ med TypeScript och Vite (`npm create vite@latest byakalendern -- --template react-ts`).
* **Styling:** Tailwind CSS.
* **Ikoner:** `lucide-react`.
* **Datakälla:** Google Calendar REST API v3 (`GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`).
* **State & Caching:** Vanlig `fetch` med lokal caching i `sessionStorage` (eller TanStack Query) för att undvika onödiga API-anrop.

---

## 3. Dataflöde & Konventioner i Google Kalender

Eftersom Google Kalender saknar dedikerade fält för "Kategori" eller "Arrangör", använder vi en smart men enkel konvention som administratören följer:

### 3.1. Automatisk kategorisering via Emoji eller Nyckelord
Appen analyserar händelsens `summary` (Titel) och `description` (Beskrivning) för att automatiskt sätta en kategori och färgbricka:
* **Fika & Gemenskap** (`amber`): Om titeln innehåller `☕`, `🇸🇪`, `🎉`, `fika`, `fest`, `midsommar`, `pub`, `grill`.
* **Natur & Fix** (`emerald`): Om titeln innehåller `🧹`, `🌸`, `🌲`, `städ`, `arbetsdag`, `brygga`, `vandring`, `fix`.
* **Loppis & Marknad** (`purple`): Om titeln innehåller `🏷️`, `🛍️`, `loppis`, `marknad`, `baklucke`, `auktion`.
* **Möten & Beslut** (`blue`): Om titeln innehåller `📋`, `🏛️`, `möte`, `årsmöte`, `stämma`, `styrelse`.
* **Idrott & Motion** (`rose`): Om titeln innehåller `⚽`, `🏃`, `träning`, `fotboll`, `gympa`, `bastu`.
* **Övrigt** (`slate`): Fallback om inget av ovanstående matchar.

### 3.2. Valfritt Arrangörsfält i beskrivningen
Om administratören skriver `Arrangör: Byalaget` på en egen rad i beskrivningen i Google Kalender, parsar appen ut detta och visar det snyggt i kortets sidfot, samt tar bort den raden från själva brödtexten.

---

## 4. Funktionella Krav (Features)

1. **Hämta kommande händelser:**
   * Hämta händelser från `timeMin = startOfToday` och framåt.
   * Parametrar: `singleEvents=true` (expanderar återkommande evenemang), `orderBy=startTime`, `maxResults=100`.
2. **Gruppering per månad:**
   * Gruppera händelser kronologiskt under månadsrubriker, t.ex. *"Maj 2026"*, *"Juni 2026"*.
3. **Sök och Kategorifilter:**
   * Fritextsökning som filtrerar på titel, beskrivning och plats i realtid.
   * Horisontellt scrollbara filterknappar i mobilvyn (t.ex. *Alla*, *Fika & Gemenskap*, *Natur & Fix*, etc.).
4. **Expanderbara händelsekort:**
   * **Hopfällt läge:** Visar datumbricka (veckodag + datum), kategori-badge, titel, tid (eller "Heldag") samt plats.
   * **Utfällt läge (vid klick):** Visar fullständig beskrivning (med klickbara länkar om beskrivningen innehåller URL:er), arrangör, länk till Google Maps för platsen samt en knapp för *"Lägg till i min kalender"*.
5. **"Lägg till i min kalender" & Prenumerera:**
   * På varje kort: En knapp som öppnar en direktlänk till Google Calendar Template eller laddar ner en `.ics`-fil för just det evenemanget.
   * I sidopanelen/footern: En knapp *"Synka hela bykalendern till mobilen"* som öppnar kalenderns publika `.ics` (`webcal://`) så bybor kan prenumerera på allt.
6. **Fallback / Demo-läge:**
   * Om miljövariablerna `VITE_GOOGLE_API_KEY` eller `VITE_GOOGLE_CALENDAR_ID` saknas, ska appen automatiskt visa realistisk mock-data och en diskret liten banner om att den körs i demoläge. Detta gör det enkelt att utveckla UI:t lokalt direkt.

---

## 5. Design & Layout (Responsivitet)

* **Färgtema:** Jordnära och inbjudande skogsgrönt tema (`emerald-800` i header, `slate-50` som bakgrund, vita kort med `border-slate-200`).
* **Mobilvy (< 1024px):**
  * Kompakt header med sökfält inbakat.
  * Sticky horisontell rad med kategoripiller (`overflow-x-auto no-scrollbar`).
  * Fokus på tum-vänliga kort i en enda kolumn.
* **Desktopvy (>= 1024px):**
  * 2-kolumnslayout (`grid-cols-3`):
    * **Vänster (2/3 bredd):** Tidslinjen med alla händelser grupperade per månad.
    * **Höger (1/3 bredd):** Sticky sidopanel med 3 informationskort:
      1. *Ha byn i din egen mobil* (Prenumerationsknapp).
      2. *Vill du ha med något i kalendern?* (Kontaktuppgifter till kalenderansvarig/morsan).
      3. *Byns viktiga platser & kontakter* (Kort statisk lista, t.ex. Bygdegårdsbokning, Bastu, Återvinning).

---

## 6. Förslag på Filstruktur

```text
src/
├── components/
│   ├── Header.tsx             # Hero-header med titel och sökfält
│   ├── CategoryFilter.tsx     # Filterknappar (horisontell scroll på mobil)
│   ├── EventCard.tsx          # Enskilt händelsekort (expanderbart)
│   ├── EventTimeline.tsx      # Månadsgrupperad lista av EventCards
│   └── Sidebar.tsx            # Sidopanel med prenumeration, tipsa-info & kontakter
├── services/
│   ├── calendarService.ts     # Fetch-logik mot Google Calendar API + parsning
│   └── mockEvents.ts          # Fallback-data när API-nyckel ej är satt
├── types/
│   └── calendar.ts            # TypeScript-interfaces för Google Event & App Event
├── utils/
│   ├── categoryParser.ts      # Logik för att matcha emoji/nyckelord -> kategori
│   └── calendarLinks.ts       # Genererar Google Cal-länkar, Maps-länkar & .ics
├── config/
│   └── villageConfig.ts       # Statisk konfiguration (Byns namn, kontaktmail, viktiga platser)
└── App.tsx
```

---

## 7. Miljövariabler (`.env.example`)

```env
VITE_GOOGLE_API_KEY=din_google_cloud_api_key_här
VITE_GOOGLE_CALENDAR_ID=din_kalender_id@group.calendar.google.com
```

---

## 8. Steg-för-steg för att sätta upp Google Kalender (Tar 5 min)

1. **Skapa kalendern:**
   * Gå till [calendar.google.com](https://calendar.google.com) på en dator.
   * Klicka på `+` bredvid *"Andra kalendrar"* -> **Skapa ny kalender** (t.ex. *"Händelser i Byn"*).
   * Gå in på kalenderns inställningar -> Kryssa i **"Gör tillgänglig för allmänheten"**.
   * Bjud in din morsas Google-konto under *"Dela med specifika personer"* och ge henne behörigheten *"Ändra händelser"*.
   * Kopiera **Kalender-ID** längre ner på sidan (ser ut som `xyz123@group.calendar.google.com`).

2. **Skapa & lås API-nyckeln (Gratis):**
   * Gå till [Google Cloud Console](https://console.cloud.google.com/).
   * Skapa ett nytt projekt -> Gå till *APIs & Services* -> *Library* -> Sök på **Google Calendar API** och klicka **Enable**.
   * Gå till *Credentials* -> **Create Credentials** -> **API Key**.
   * **VIKTIGT (Säkerhet):** Klicka på nyckeln för att redigera begränsningar:
     * Under *Application restrictions*: Välj **Websites** och lägg till din domän (samt `http://localhost:5173/*` för utveckling).
     * Under *API restrictions*: Välj **Restrict key** och kryssa endast i **Google Calendar API**.

---

## 9. Start-prompt till Claude

När du öppnar ditt projekt i Claude Code eller Cursor kan du klistra in följande prompt:

> *"Läs igenom `PROJECT_SPEC.md`. Skapa hela React + TypeScript + Tailwind-applikationen enligt specifikationen. Börja med att sätta upp `villageConfig.ts`, datatyperna och `calendarService.ts` (inklusive mock-fallback så att sidan fungerar direkt utan API-nyckel). Bygg sedan komponenterna med fokus på hög tillgänglighet, tydlig typografi och perfekt responsivitet för både mobil och desktop."*