# CLAUDE.md

Njutångerskalendern visar vad som händer i Njutånger: fikor, loppisar, möten, städdagar och annat. Bybor i alla åldrar besöker den, de flesta i mobilen. Händelserna läggs in i en publik Google Kalender från Google Kalender-appen, och sajten läser dem via Google Calendar API. Det finns ingen egen backend eller databas, och driften kostar 0 kr.

Originalspecen står i [docs/projektspecifikation.md](docs/projektspecifikation.md). Besluten i den här filen och i ticketarna går före specen.

## Stack

- Vite, React, TypeScript och Tailwind CSS. Ikoner från `lucide-react`.
- Vitest för logiken i `utils/` och `services/`, och Testing Library för hooks och komponenter. Tester som behöver en DOM börjar med `// @vitest-environment jsdom`, så att resten körs snabbt i Node.
- Hostas på Vercel. `main` deployas automatiskt, och varje PR får en förhandsvisning.
- Miljövariablerna `VITE_GOOGLE_API_KEY` och `VITE_GOOGLE_CALENDAR_ID`. Saknas någon av dem kör appen i demoläge med mockdata och en diskret banner.

## Språk

- Koden skrivs på engelska: komponenter, funktioner, variabler och filnamn.
- Allt som människor läser skrivs på svenska: kommentarer, commits, PR:er, issues, dokumentation och texten på sajten. Texten skrivs direkt i komponenterna, utan i18n.
- Kommentarer är sparsamma, en rad om avsikten eller skälet. Ett medvetet avsteg från en regel har alltid sitt skäl utskrivet där avsteget sitter.

## Kodprinciper

- KISS och SRP: en komponent eller funktion gör en sak, och en kollega förstår den vid första genomläsningen.
- DRY vid tredje upprepningen, inte vid den andra.
- Bygg det ticketen ber om. Något annat som dyker upp blir en ny ticket.
- Nya paket: fråga först och ge skälet. Paket som står i en ticket är redan godkända.

## Kalenderns konventioner

Den som lägger in händelser ska bara behöva skriva en vanlig titel. Det här gäller, och [docs/lathund.md](docs/lathund.md) beskriver det för henne:

- **Kategorin** kommer från emojis och nyckelord i titeln. Det nyckelord som står först i titeln vinner. Beskrivningen används bara om titeln inte matchar något. Inget som matchar ger Övrigt.
- **Matchningen** sker på delord utan hänsyn till versaler, så att "Styrelsemöte" matchar `möte`. Nyckelord på tre bokstäver eller kortare måste vara hela ord, så att `pub` inte matchar "publik".
- **`Arrangör: X`** på en egen rad i beskrivningen visas i kortets sidfot och tas bort från brödtexten.
- **En händelse över flera dagar** blir ett kort med datumintervall, sorteras på startdagen och syns tills den är slut.

Ändras en konvention uppdateras lathunden i samma PR.

## Versioner

`.nvmrc` låser Node lokalt och i CI, och `engines` i `package.json` gör samma sak för Vercel, som inte läser `.nvmrc`. `yarn.lock` låser paketen. Pakethanteraren är yarn, så att `yarn.lock` förblir den enda lockfilen.

## Arbetsflöde

Varje ticket går igenom de här stegen i ordning. Claude sköter git-stegen: branch, commits, push och PR. André bestämmer när det mergas.

1. **Grilla.** En ny epic grillas på djupet med `/grilling`. En ticket får en snabb genomgång av det som fortfarande är öppet. Besluten skrivs in i ticketen. Klart när ticketen inte har någon öppen fråga kvar.
2. **Brancha** från en uppdaterad `main`: `feature/<issuenummer>`.
3. **Bygg** ticketen, committa löpande och pusha. Commits skrivs på svenska i imperativ form.
4. **Claude testar:** testerna är gröna, och sajten körs i webbläsarpanelen i både mobil- och desktopbredd.
5. **André testar** på en riktig mobil, gärna via Vercels förhandsvisning.
6. **Granska** med `/code-review` och rätta det som kommer fram.
7. **PR:** titeln är ticketens titel och beskrivningen följer mallen. Ett val som inte är självklart får sitt skäl i beskrivningen.
8. **Merga** med squash när André säger till. Flytta ticketen till Done.

Förklara kort medan du bygger, och bara när ett val inte är självklart.

### Klar-kriterier

En ticket är klar när allt det här stämmer:

- Ticketens "Klart när" är uppfyllt.
- CI är grön. Kör samma kontroller lokalt före PR, så att en röd check aldrig är en överraskning. De står i `.github/workflows/ci.yml`.
- Logiken som ticketen rör har tester.
- Claude och André har testat enligt steg 4 och 5.
- `/code-review` är körd.
- CLAUDE.md, README och lathunden är uppdaterade i samma PR om ett mönster eller en regel ändrats.

### Git

`main` är skyddad. Allt går via PR, och CI måste vara grön. Det gäller även repoägaren. En PR håller sig till en ticket. Commits och PR:er har ingen Claude-attribution.
