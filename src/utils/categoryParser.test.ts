import { describe, expect, test } from 'vitest';
import { categorize } from './categoryParser';

describe('categorize', () => {
  test('ett nyckelord i titeln ger sin kategori', () => {
    expect(categorize('Fika i bygdegården').category).toBe('gemenskap');
    expect(categorize('Städdag vid badplatsen').category).toBe('gemenskap');
    expect(categorize('Loppis på skolgården').category).toBe('loppis');
    expect(categorize('Gudstjänst i kyrkan').category).toBe('kyrka');
    expect(categorize('Fotboll för barn').category).toBe('idrott');
  });

  test('inget som matchar ger Övrigt', () => {
    expect(categorize('Bokcirkel').category).toBe('ovrigt');
  });

  test('det nyckelord som står först i titeln vinner', () => {
    expect(categorize('Barnloppis på skolgården').category).toBe('barn');
    expect(categorize('Fika efter städdagen').category).toBe('gemenskap');
    expect(categorize('Planeringsmöte för hantverksmarknaden').category).toBe('loppis');
  });

  test('matchar delord utan hänsyn till versaler', () => {
    expect(categorize('GUDSTJÄNST').category).toBe('kyrka');
    expect(categorize('Vårstädning vid bryggan').category).toBe('gemenskap');
    expect(categorize('Fixardag').category).toBe('gemenskap');
  });

  test('matchar å, ä och ö även när de är skrivna som bokstav plus prickar', () => {
    expect(categorize('Försäljning på skölan').category).toBe('loppis');
    expect(categorize('Vårstädning').category).toBe('gemenskap');
  });

  test('korta nyckelord måste vara hela ord', () => {
    expect(categorize('Pub i bygdegården').category).toBe('gemenskap');
    expect(categorize('Quiz på puben').category).toBe('ovrigt');
    expect(categorize('Publik visning').category).toBe('ovrigt');
  });

  test('emojis räknas som nyckelord, med och utan variationstecken', () => {
    expect(categorize('\u{1F3F7}\u{FE0F} Bord att sälja').category).toBe('loppis');
    expect(categorize('\u{1F3F7} Bord att sälja').category).toBe('loppis');
    expect(categorize('Bokcirkel ☕').category).toBe('gemenskap');
    expect(categorize('⛪ Fika efter gudstjänsten').category).toBe('kyrka');
  });

  test('beskrivningen används bara när titeln inte matchar', () => {
    expect(categorize('Söndagsträff', 'Vi bjuder på fika och pratar om sommaren.').category).toBe('gemenskap');
    expect(categorize('Loppis', 'Fika finns att köpa.').category).toBe('loppis');
    expect(categorize('Söndagsträff', 'Ta med något gott.').category).toBe('ovrigt');
  });

  // Mockdatans titlar, utskrivna här så att facit inte flyttar sig om mockdatan ändras.
  test.each([
    ['☕ Förmiddagsfika i bygdegården', 'gemenskap'],
    ['⛪ Kyrkorådet', 'kyrka'],
    ['🧹 Städdag vid badplatsen', 'gemenskap'],
    ['🏷️ Loppis på skolgården', 'loppis'],
    ['⚽ Fotbollsträning för barn', 'idrott'],
    ['Bastukväll', 'idrott'],
    ['Årsmöte med fika', 'gemenskap'],
    ['🎉 Byfest', 'gemenskap'],
    ['🧒 Scouterna vandrar längs ån', 'barn'],
    ['Bokcirkel', 'ovrigt'],
    ['Auktion i bygdegården', 'loppis'],
    ['Planeringsmöte för hantverksmarknaden', 'loppis'],
    ['🛍️ Hantverksmarknad', 'loppis'],
  ])('"%s" blir %s', (title, expected) => {
    expect(categorize(title).category).toBe(expected);
  });
});

describe('categorize med emoji', () => {
  test('ger emojin som avgjorde kategorin, som den står i titeln', () => {
    expect(categorize('☕ Förmiddagsfika')).toEqual({ category: 'gemenskap', emoji: '☕' });
    expect(categorize('TEST ☕ Fika')).toEqual({ category: 'gemenskap', emoji: '☕' });
    expect(categorize('🇸🇪 Midsommar')).toEqual({ category: 'gemenskap', emoji: '🇸🇪' });
  });

  test('behåller variationstecknet när titeln har det, och lägger inte till det annars', () => {
    expect(categorize('\u{1F3F7}\u{FE0F} Loppis').emoji).toBe('\u{1F3F7}\u{FE0F}');
    expect(categorize('\u{1F3F7} Loppis').emoji).toBe('\u{1F3F7}');
  });

  test('ger ingen emoji när ett ord eller beskrivningen avgjorde', () => {
    expect(categorize('Byfest 🎉 med grill')).toEqual({ category: 'gemenskap' });
    expect(categorize('Fika i stugan')).toEqual({ category: 'gemenskap' });
    expect(categorize('Söndagsträff', 'Vi bjuder på fika ☕')).toEqual({ category: 'gemenskap' });
    expect(categorize('Bokcirkel')).toEqual({ category: 'ovrigt' });
  });

  test('kyrkans ord och delordet kyrk ger Kyrka, även före ett ord för Gemenskap (beslut i #54)', () => {
    expect(categorize('Kyrkfika').category).toBe('kyrka');
    expect(categorize('Andakt vid sjön').category).toBe('kyrka');
    expect(categorize('Konsert i EFS-kyrkan').category).toBe('kyrka');
    expect(categorize('Bön för fred').category).toBe('kyrka');
    expect(categorize('\u{1F54A} Minnesstund').category).toBe('kyrka');
  });

  test('barn och ungdom, med lek som ett helt ord', () => {
    expect(categorize('🧒 Pyssel på biblioteket').category).toBe('barn');
    expect(categorize('Scoutläger').category).toBe('barn');
    expect(categorize('Lek och bus i parken').category).toBe('barn');
    expect(categorize('Blek vinterdag').category).toBe('ovrigt');
  });

  test('möten har ingen egen kategori längre', () => {
    expect(categorize('Styrelsemöte').category).toBe('ovrigt');
    expect(categorize('Årsmöte med fika').category).toBe('gemenskap');
  });
});
