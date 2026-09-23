import assert from 'node:assert/strict';
import {feedbackMailto, FEEDBACK_EMAIL, MAX_FEEDBACK_LENGTH, parseLikes} from '../src/feedback.ts';

// Untrusted feedback cannot add recipients or query parameters to the email draft.
const message = 'Great! &bcc=unwanted@example.test\r\n<script>alert(1)</script> # ? + % 🎥';
const draft = new URL(feedbackMailto(message));
assert.equal(draft.protocol, 'mailto:');
assert.equal(draft.pathname, FEEDBACK_EMAIL);
assert.deepEqual([...draft.searchParams.keys()], ['subject', 'body']);
assert.equal(draft.searchParams.get('body'), message);
assert.equal(draft.hash, '');
assert.equal(new URL(feedbackMailto('a'.repeat(2000))).searchParams.get('body').length, MAX_FEEDBACK_LENGTH);
assert.equal(new URL(feedbackMailto('   hello   ')).searchParams.get('body'), 'hello');
assert.doesNotThrow(() => feedbackMailto('a'.repeat(999) + '🎥'));
assert.doesNotThrow(() => feedbackMailto('\ud800'));
for (const invalid of [null, '', '-1', 'Infinity', 'NaN', '1e4', '<script>', '123456789', '{"count":4}']) assert.equal(parseLikes(invalid), 0);
assert.equal(parseLikes('42'), 42);
assert.equal(parseLikes('9999999'), 9999999);
console.log('Passed: feedback recipient and query isolation, length bounds, Unicode encoding, whitespace normalization and corrupt like-storage handling.');
