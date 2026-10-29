import assert from 'node:assert/strict';
import test from 'node:test';
import app, { app as namedApp } from '../src/index.js';
import appFromRecognizedEntrypoint, { createApp } from '../src/app.js';

test('the Vercel entrypoint exports the Express app without starting a listener', () => {
  assert.equal(app, namedApp);
  assert.equal(app, appFromRecognizedEntrypoint);
  assert.equal(typeof createApp, 'function');
  assert.equal(typeof app, 'function');
  assert.equal(app.listening, undefined);
});
