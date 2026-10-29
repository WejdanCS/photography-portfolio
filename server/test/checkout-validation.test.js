import assert from 'node:assert/strict';
import test from 'node:test';
import { readCheckoutInput } from '../src/routes/checkout.js';

const validInput = {
  serviceId: 'portrait',
  message: 'A portrait session.',
};

test('preferred date remains optional', () => {
  const result = readCheckoutInput(validInput, '2026-10-29');
  assert.equal(result.error, undefined);
  assert.equal(result.value.preferredDate, null);
});

test('rejects today and past dates', () => {
  assert.equal(
    readCheckoutInput({ ...validInput, preferredDate: '2026-10-29' }, '2026-10-29').error,
    'Preferred date must be after today.',
  );
  assert.equal(
    readCheckoutInput({ ...validInput, preferredDate: '2026-10-28' }, '2026-10-29').error,
    'Preferred date must be after today.',
  );
});

test('accepts a valid future date', () => {
  const result = readCheckoutInput({ ...validInput, preferredDate: '2026-10-30' }, '2026-10-29');
  assert.equal(result.error, undefined);
  assert.equal(result.value.preferredDate, '2026-10-30');
});

test('rejects malformed and impossible calendar dates', () => {
  assert.match(
    readCheckoutInput({ ...validInput, preferredDate: '2026-02-30' }, '2026-01-01').error,
    /valid date/,
  );
  assert.match(
    readCheckoutInput({ ...validInput, preferredDate: '30-10-2026' }, '2026-01-01').error,
    /valid date/,
  );
});
