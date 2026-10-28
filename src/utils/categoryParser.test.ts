import { describe, expect, test } from 'vitest';
import { categorize } from './categoryParser';

describe('categorize', () => {
  test('ett nyckelord i titeln ger sin kategori', () => {
    expect(categorize('Fika i bygdegården').category).toBe('fika');
    expect(categorize('Städdag vid badplatsen').category).toBe('natur');
    expect(categorize('Loppis på skolgården').category).toBe('loppis');
    expect(categorize('Styrelsemöte').category).toBe('moten');
    expect(categorize('Fotboll för barn').category).toBe('idrott');
  });

  test('inget som matchar ger Övrigt', () => {
    expect(categorize('Bokcirkel').category).toBe('ovrigt');
  });

  test('det nyckelord som står först i titeln vinner', () => {
    expect(categorize('Årsmöte med fika').category).toBe('moten');
    expect(categorize('Fika efter städdagen').category).toBe('fika');
    expect(categorize('Planeringsmöte för hantverksmarknaden').category).toBe('moten');
  });

  test('matchar delord utan hänsyn till versaler', () => {
    expect(categorize('STYRELSEMÖTE').category).toBe('moten');
    expect(categorize('Vårstädning vid bryggan').category).toBe('natur');
    expect(categorize('Fixardag').category).toBe('natur');
  });

  test('matchar å, ä och ö även när de är skrivna som bokstav plus prickar', () => {
    expect(categorize('Möte i bygdegården').category).toBe('moten');
    expect(categorize('Vårstädning').category).toBe('natur');
  });

  test('korta nyckelord måste vara hela ord', () => {
    expect(categorize('Pub i bygdegården').category).toBe('fika');
    expect(categorize('Quiz på puben').category).toBe('ovrigt');
    expect(categorize('Publik visning').category).toBe('ovrigt');
  });

  test('emojis räknas som nyckelord, med och utan variationstecken', () => {
    expect(categorize('\u{1F3F7}\u{FE0F} Bord att sälja').category).toBe('loppis');
    expect(categorize('\u{1F3F7} Bord att sälja').category).toBe('loppis');
    expect(categorize('Bokcirkel ☕').category).toBe('fika');
    expect(categorize('📋 Fika efter mötet').category).toBe('moten');
  });

  test('beskrivningen används bara när titeln inte matchar', () => {
    expect(categorize('Söndagsträff', 'Vi bjuder på fika och pratar om sommaren.').category).toBe('fika');
    expect(categorize('Loppis', 'Fika finns att köpa.').category).toBe('loppis');
    expect(categorize('Söndagsträff', 'Ta med något gott.').category).toBe('ovrigt');
  });

  // Mockdatans titlar, utskrivna här så att facit inte flyttar sig om mockdatan ändras.
  test.each([
    ['☕ Förmiddagsfika i bygdegården', 'fika'],
    ['📋 Styrelsemöte', 'moten'],
    ['🧹 Städdag vid badplatsen', 'natur'],
    ['🏷️ Loppis på skolgården', 'loppis'],
    ['⚽ Fotbollsträning för barn', 'idrott'],
    ['Bastukväll', 'idrott'],
    ['Årsmöte med fika', 'moten'],
    ['🎉 Byfest', 'fika'],
    ['Vandring längs ån', 'natur'],
    ['Bokcirkel', 'ovrigt'],
    ['Auktion i bygdegården', 'loppis'],
    ['Planeringsmöte för hantverksmarknaden', 'moten'],
    ['🛍️ Hantverksmarknad', 'loppis'],
  ])('"%s" blir %s', (title, expected) => {
    expect(categorize(title).category).toBe(expected);
  });
});

describe('categorize med emoji', () => {
  test('ger emojin som avgjorde kategorin, som den står i titeln', () => {
    expect(categorize('☕ Förmiddagsfika')).toEqual({ category: 'fika', emoji: '☕' });
    expect(categorize('TEST ☕ Fika')).toEqual({ category: 'fika', emoji: '☕' });
    expect(categorize('🇸🇪 Midsommar')).toEqual({ category: 'fika', emoji: '🇸🇪' });
  });

  test('behåller variationstecknet när titeln har det, och lägger inte till det annars', () => {
    expect(categorize('\u{1F3F7}\u{FE0F} Loppis').emoji).toBe('\u{1F3F7}\u{FE0F}');
    expect(categorize('\u{1F3F7} Loppis').emoji).toBe('\u{1F3F7}');
  });

  test('ger ingen emoji när ett ord eller beskrivningen avgjorde', () => {
    expect(categorize('Byfest 🎉 med grill')).toEqual({ category: 'fika' });
    expect(categorize('Fika i stugan')).toEqual({ category: 'fika' });
    expect(categorize('Söndagsträff', 'Vi bjuder på fika ☕')).toEqual({ category: 'fika' });
    expect(categorize('Bokcirkel')).toEqual({ category: 'ovrigt' });
  });
});
