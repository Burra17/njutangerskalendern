import { expect, test } from 'vitest';

// Bevisar att Vitest-kedjan fungerar. Tas bort när de första riktiga testerna kommer i #7.
test('vitest kör', () => {
  expect(1 + 1).toBe(2);
});
