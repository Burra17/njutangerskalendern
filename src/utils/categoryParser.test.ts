import { describe, expect, test } from 'vitest';
import { categorize, categorizeWithEmoji } from './categoryParser';

describe('categorize', () => {
  test('ett nyckelord i titeln ger sin kategori', () => {
    expect(categorize('Fika i bygdegården')).toBe('fika');
    expect(categorize('Städdag vid badplatsen')).toBe('natur');
    expect(categorize('Loppis på skolgården')).toBe('loppis');
    expect(categorize('Styrelsemöte')).toBe('moten');
    expect(categorize('Fotboll för barn')).toBe('idrott');
  });

  test('inget som matchar ger Övrigt', () => {
    expect(categorize('Bokcirkel')).toBe('ovrigt');
  });

  test('det nyckelord som står först i titeln vinner', () => {
    expect(categorize('Årsmöte med fika')).toBe('moten');
    expect(categorize('Fika efter städdagen')).toBe('fika');
    expect(categorize('Planeringsmöte för hantverksmarknaden')).toBe('moten');
  });

  test('matchar delord utan hänsyn till versaler', () => {
    expect(categorize('STYRELSEMÖTE')).toBe('moten');
    expect(categorize('Vårstädning vid bryggan')).toBe('natur');
    expect(categorize('Fixardag')).toBe('natur');
  });

  test('matchar å, ä och ö även när de är skrivna som bokstav plus prickar', () => {
    expect(categorize('Möte i bygdegården')).toBe('moten');
    expect(categorize('Vårstädning')).toBe('natur');
  });

  test('korta nyckelord måste vara hela ord', () => {
    expect(categorize('Pub i bygdegården')).toBe('fika');
    expect(categorize('Quiz på puben')).toBe('ovrigt');
    expect(categorize('Publik visning')).toBe('ovrigt');
  });

  test('emojis räknas som nyckelord, med och utan variationstecken', () => {
    expect(categorize('\u{1F3F7}\u{FE0F} Bord att sälja')).toBe('loppis');
    expect(categorize('\u{1F3F7} Bord att sälja')).toBe('loppis');
    expect(categorize('Bokcirkel ☕')).toBe('fika');
    expect(categorize('📋 Fika efter mötet')).toBe('moten');
  });

  test('beskrivningen används bara när titeln inte matchar', () => {
    expect(categorize('Söndagsträff', 'Vi bjuder på fika och pratar om sommaren.')).toBe('fika');
    expect(categorize('Loppis', 'Fika finns att köpa.')).toBe('loppis');
    expect(categorize('Söndagsträff', 'Ta med något gott.')).toBe('ovrigt');
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
    expect(categorize(title)).toBe(expected);
  });
});

describe('categorizeWithEmoji', () => {
  test('ger emojin som avgjorde kategorin, som den står i titeln', () => {
    expect(categorizeWithEmoji('☕ Förmiddagsfika')).toEqual({ category: 'fika', emoji: '☕' });
    expect(categorizeWithEmoji('TEST ☕ Fika')).toEqual({ category: 'fika', emoji: '☕' });
    expect(categorizeWithEmoji('🇸🇪 Midsommar')).toEqual({ category: 'fika', emoji: '🇸🇪' });
  });

  test('behåller variationstecknet när titeln har det, och lägger inte till det annars', () => {
    expect(categorizeWithEmoji('\u{1F3F7}\u{FE0F} Loppis').emoji).toBe('\u{1F3F7}\u{FE0F}');
    expect(categorizeWithEmoji('\u{1F3F7} Loppis').emoji).toBe('\u{1F3F7}');
  });

  test('ger ingen emoji när ett ord eller beskrivningen avgjorde', () => {
    expect(categorizeWithEmoji('Byfest 🎉 med grill')).toEqual({ category: 'fika', emoji: null });
    expect(categorizeWithEmoji('Fika i stugan')).toEqual({ category: 'fika', emoji: null });
    expect(categorizeWithEmoji('Söndagsträff', 'Vi bjuder på fika ☕')).toEqual({ category: 'fika', emoji: null });
    expect(categorizeWithEmoji('Bokcirkel')).toEqual({ category: 'ovrigt', emoji: null });
  });
});
