import { describe, expect, test } from 'vitest';
import { addDays, stockholmMidnight, stockholmOffset, toStockholmDate } from './dates';

describe('stockholmMidnight', () => {
  test('ger midnatt med dagens förskjutning', () => {
    expect(stockholmMidnight('2026-06-19')).toBe('2026-06-19T00:00:00+02:00');
    expect(stockholmMidnight('2026-12-19')).toBe('2026-12-19T00:00:00+01:00');
  });

  test('ger rätt förskjutning de dagar klockan ställs om, eftersom midnatt kommer före omställningen', () => {
    expect(stockholmMidnight('2026-03-29')).toBe('2026-03-29T00:00:00+01:00');
    expect(stockholmMidnight('2026-10-25')).toBe('2026-10-25T00:00:00+02:00');
  });
});

describe('toStockholmDate', () => {
  test('ger dagens datum i Stockholm', () => {
    expect(toStockholmDate(new Date('2026-06-19T12:00:00Z'))).toBe('2026-06-19');
  });

  test('har redan bytt dag i Stockholm när det fortfarande är kväll i UTC', () => {
    expect(toStockholmDate(new Date('2026-06-18T22:30:00Z'))).toBe('2026-06-19');
    expect(toStockholmDate(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
  });
});

describe('addDays', () => {
  test('lägger till dagar inom en månad', () => {
    expect(addDays('2026-06-19', 3)).toBe('2026-06-22');
  });

  test('går över månads- och årsskiften', () => {
    expect(addDays('2026-06-29', 3)).toBe('2026-07-02');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
  });

  test('räknar rätt över bytet till vintertid', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });

  test('kan gå bakåt', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('stockholmOffset', () => {
  test('är +02:00 på sommaren och +01:00 på vintern', () => {
    expect(stockholmOffset('2026-06-19')).toBe('+02:00');
    expect(stockholmOffset('2026-12-19')).toBe('+01:00');
  });
});
