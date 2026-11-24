import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BIRTHDAY_CONFIG,
  DEFAULT_YOUTUBE_VIDEO_ID,
} from '../data/birthdayConfig';
import {
  extractYouTubeVideoId,
  hasValidationErrors,
  normalizeConfig,
  normalizeWishes,
  parseLetterTextToParagraphs,
  validateWishInput,
} from './validation';

test('validateWishInput returns explicit Indonesian messages for empty or short fields', () => {
  const emptyErrors = validateWishInput({ name: '   ', relation: '', message: '' });
  assert.equal(emptyErrors.name, 'Tuliskan namamu terlebih dahulu');
  assert.equal(emptyErrors.message, 'Ucapan minimal 8 karakter');
  assert.equal(hasValidationErrors(emptyErrors), true);

  const shortMessageErrors = validateWishInput({
    name: 'Alya',
    relation: 'Teman kuliah',
    message: 'HBD ya',
  });
  assert.equal(shortMessageErrors.name, undefined);
  assert.equal(shortMessageErrors.message, 'Ucapan minimal 8 karakter');
  assert.equal(hasValidationErrors(shortMessageErrors), true);

  const validErrors = validateWishInput({
    name: 'Alya',
    relation: 'Teman kuliah',
    message: 'Semoga tahun ini penuh kesehatan dan hari hari yang tenang.',
  });
  assert.equal(hasValidationErrors(validErrors), false);
});

test('extractYouTubeVideoId parses watch, short, embed, and raw 11-char IDs', () => {
  assert.equal(extractYouTubeVideoId('koZK67e1C-U'), 'koZK67e1C-U');
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=koZK67e1C-U&list=RDkoZK67e1C-U'),
    'koZK67e1C-U'
  );
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/koZK67e1C-U?si=abc123'),
    'koZK67e1C-U'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/embed/koZK67e1C-U'),
    'koZK67e1C-U'
  );
  assert.equal(extractYouTubeVideoId('https://example.com/not-youtube'), null);
});

test('normalizeConfig falls back safely on malformed stored data', () => {
  const recovered = normalizeConfig(null, DEFAULT_BIRTHDAY_CONFIG);
  assert.deepEqual(recovered, DEFAULT_BIRTHDAY_CONFIG);

  const partial = normalizeConfig(
    {
      celebrantName: 'Nadia',
      turningAge: '22',
      letterBody: ['Paragraf baru.'],
      surpriseTitle: 'Kupon Kopi Pagi di Bandung',
      youtubeVideoId: 'https://youtu.be/koZK67e1C-U',
    },
    DEFAULT_BIRTHDAY_CONFIG
  );
  assert.equal(partial.celebrantName, 'Nadia');
  assert.equal(partial.turningAge, '22');
  assert.equal(partial.birthplace, 'Sungai Sirah');
  assert.deepEqual(partial.letterBody, ['Paragraf baru.']);
  assert.equal(partial.senderName, DEFAULT_BIRTHDAY_CONFIG.senderName);
  assert.equal(
    partial.dedicationClosingPhrase,
    DEFAULT_BIRTHDAY_CONFIG.dedicationClosingPhrase
  );
  assert.equal(partial.surpriseTitle, 'Kupon Kopi Pagi di Bandung');
  assert.equal(partial.surpriseSubtitle, DEFAULT_BIRTHDAY_CONFIG.surpriseSubtitle);
  assert.equal(partial.surpriseNote, DEFAULT_BIRTHDAY_CONFIG.surpriseNote);
  assert.equal(partial.youtubeVideoId, DEFAULT_YOUTUBE_VIDEO_ID);
  assert.equal(DEFAULT_BIRTHDAY_CONFIG.celebrantName, 'Dinda Hendra Putri');
  assert.equal(DEFAULT_BIRTHDAY_CONFIG.birthdate, '2004-11-24');
});

test('normalizeWishes filters out invalid objects cleanly', () => {
  const result = normalizeWishes([
    {
      id: 'w1',
      name: 'Raka',
      relation: 'Saudara',
      message: 'Selamat ulang tahun, sehat selalu.',
      createdAt: '2026-03-13T08:00:00.000Z',
    },
    { id: 123, broken: true },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Raka');
});

test('parseLetterTextToParagraphs splits double line breaks cleanly', () => {
  const paragraphs = parseLetterTextToParagraphs('Paragraf satu.\n\nParagraf dua.\n\n  ');
  assert.deepEqual(paragraphs, ['Paragraf satu.', 'Paragraf dua.']);
});
