import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCheckoutInput } from '../src/validators/checkout.js';

const validInput = { serviceId: 'portrait', message: 'A portrait session.' };

test('preferred date remains optional', () => {
  assert.equal(validateCheckoutInput(validInput, '2026-10-29').preferredDate, null);
});

test('rejects today and past dates with structured details', () => {
  for (const date of ['2026-10-29', '2026-10-28']) {
    assert.throws(
      () => validateCheckoutInput({ ...validInput, preferredDate: date }, '2026-10-29'),
      (error) => error.code === 'VALIDATION_ERROR' && error.details[0].path === 'preferredDate',
    );
  }
});

test('accepts a valid future date', () => {
  assert.equal(
    validateCheckoutInput({ ...validInput, preferredDate: '2026-10-30' }, '2026-10-29').preferredDate,
    '2026-10-30',
  );
});

test('rejects malformed and impossible calendar dates', () => {
  for (const date of ['2026-02-30', '30-10-2026']) {
    assert.throws(
      () => validateCheckoutInput({ ...validInput, preferredDate: date }, '2026-01-01'),
      (error) => error.details.some((detail) => /valid date/.test(detail.message)),
    );
  }
});
