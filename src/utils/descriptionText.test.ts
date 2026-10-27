import { describe, expect, test } from 'vitest';
import { extractOrganizer, toPlainText } from './descriptionText';

describe('extractOrganizer', () => {
  test('plockar ut arrangören och tar bort raden', () => {
    expect(extractOrganizer('Kaffe och bullar.\nArrangör: Fikagruppen')).toEqual({ organizer: 'Fikagruppen', text: 'Kaffe och bullar.' });
    expect(extractOrganizer('Arrangör: Byalaget\nVälkomna!')).toEqual({ organizer: 'Byalaget', text: 'Välkomna!' });
  });

  test('lämnar ingen tom rad där raden satt', () => {
    expect(extractOrganizer('Rad ett\nArrangör: Byalaget\nRad två').text).toBe('Rad ett\nRad två');
    expect(extractOrganizer('Rad ett\n\nArrangör: Byalaget\n\nRad två').text).toBe('Rad ett\n\nRad två');
  });

  test('tål små bokstäver och mellanslag runt kolonet', () => {
    expect(extractOrganizer('arrangör : Byalaget').organizer).toBe('Byalaget');
    expect(extractOrganizer('  ARRANGÖR:Byalaget  ').organizer).toBe('Byalaget');
  });

  test('använder bara den första raden', () => {
    expect(extractOrganizer('Arrangör: Byalaget\nArrangör: Kyrkan')).toEqual({ organizer: 'Byalaget', text: 'Arrangör: Kyrkan' });
  });

  test('tar bort en rad utan namn men ger ingen arrangör', () => {
    expect(extractOrganizer('Välkomna!\nArrangör:')).toEqual({ organizer: undefined, text: 'Välkomna!' });
  });

  test('lämnar ordet arrangör mitt i en mening orört', () => {
    expect(extractOrganizer('Vi söker en arrangör: hör av dig!').organizer).toBeUndefined();
  });

  test('ger ingen arrangör när raden saknas', () => {
    expect(extractOrganizer('Välkomna!')).toEqual({ organizer: undefined, text: 'Välkomna!' });
  });
});

describe('toPlainText', () => {
  test('lämnar ren text orörd', () => {
    expect(toPlainText('Ta med kaffe.\nVälkomna!')).toBe('Ta med kaffe.\nVälkomna!');
  });

  test('gör <br> och stycken till radbrytningar', () => {
    expect(toPlainText('Rad ett<br>Rad två<br/>Rad tre')).toBe('Rad ett\nRad två\nRad tre');
    expect(toPlainText('<p>Ungefär 8 km.</p><p>Ta med matsäck.</p>')).toBe('Ungefär 8 km.\nTa med matsäck.');
  });

  test('skriver ut länkens adress, efter texten när de skiljer sig', () => {
    expect(toPlainText('Se <a href="https://example.com/anmalan">Anmälan</a> här.')).toBe('Se Anmälan (https://example.com/anmalan) här.');
    expect(toPlainText('<a href="https://example.com">https://example.com</a>')).toBe('https://example.com');
    expect(toPlainText("<a target='_blank' href='https://example.com/a'>Läs mer</a>")).toBe('Läs mer (https://example.com/a)');
  });

  test('gör listpunkter till egna rader och tar bort övriga taggar', () => {
    expect(toPlainText('Schema:<ul><li>Fredag: dans</li><li><b>Lördag</b>: marknad</li></ul>')).toBe('Schema:\n• Fredag: dans\n• Lördag: marknad');
    expect(toPlainText('<i>Obs!</i> <span style="color:red">Ny tid</span>')).toBe('Obs! Ny tid');
  });

  test('klarar en riktig beskrivning från Googles webbredigerare', () => {
    const fromGoogle =
      'Dagordning:<br><ul><li>hej</li><li>tja</li></ul><a href="https://www.efsbrogarden.se">Vandrarhem</a><br><br>Arrangör: Byalaget';
    expect(toPlainText(fromGoogle)).toBe('Dagordning:\n• hej\n• tja\nVandrarhem (https://www.efsbrogarden.se)\n\nArrangör: Byalaget');
  });

  test('avkodar entiteter', () => {
    expect(toPlainText('Kaffe &amp; bulle&nbsp;20&nbsp;kr, &quot;fika&quot; &lt;3 &#39;välkommen&#39; &#8211; &#x2764;')).toBe(
      'Kaffe & bulle 20 kr, "fika" <3 \'välkommen\' – ❤',
    );
  });

  test('avkodar svenska bokstäver och lämnar trasiga entiteter orörda', () => {
    expect(toPlainText('Arrang&ouml;r: Byalaget, &Aring;sa &auml;r d&auml;r')).toBe('Arrangör: Byalaget, Åsa är där');
    expect(toPlainText('Trasig &#99999999; och &okänd;')).toBe('Trasig &#99999999; och &okänd;');
  });

  test('gör Windows-radbrytningar till vanliga', () => {
    expect(toPlainText('Rad ett\r\n\r\n\r\n\r\nRad två')).toBe('Rad ett\n\nRad två');
  });

  test('slår ihop flera tomma rader till en', () => {
    expect(toPlainText('Rad ett<br><br><br><br>Rad två')).toBe('Rad ett\n\nRad två');
    expect(toPlainText('Rad ett\n\n\n\nRad två')).toBe('Rad ett\n\nRad två');
  });
});
