import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBirthdayStats,
  extractMonogram,
  formatIndonesianDate,
  parseBirthdate,
} from './birthdayMath';

test('parseBirthdate validates ISO calendar dates accurately', () => {
  assert.deepEqual(parseBirthdate('2005-03-13'), { year: 2005, month: 3, day: 13 });
  assert.equal(parseBirthdate('2005-02-30'), null);
  assert.equal(parseBirthdate('invalid-date'), null);
});

test('formatIndonesianDate formats dates into natural Indonesian', () => {
  assert.equal(formatIndonesianDate('2005-03-13'), '13 Maret 2005');
  assert.equal(formatIndonesianDate('bad'), 'Tanggal belum diatur');
});

test('calculateBirthdayStats computes years lived and next birthday countdown', () => {
  const referenceNow = new Date(2026, 10, 23, 10, 30, 0, 0);
  const stats = calculateBirthdayStats('2005-03-13', referenceNow);

  assert.equal(stats.isValid, true);
  assert.equal(stats.yearsLived, 21);
  assert.equal(stats.isBirthdayToday, false);
  assert.equal(stats.upcomingAge, 22);
  assert.equal(stats.daysSinceLastBirthday, 255);
  assert.equal(stats.hoursRemainder, 10);
  assert.equal(stats.minutesRemainder, 30);
  assert.ok(stats.daysUntilNextBirthday > 100 && stats.daysUntilNextBirthday < 120);
  assert.ok(stats.totalDaysLived > 7500);
});

test('calculateBirthdayStats detects exact birthday today', () => {
  const birthdayNow = new Date(2026, 2, 13, 8, 15, 0, 0);
  const stats = calculateBirthdayStats('2005-03-13', birthdayNow);

  assert.equal(stats.isValid, true);
  assert.equal(stats.isBirthdayToday, true);
  assert.equal(stats.yearsLived, 21);
  assert.equal(stats.daysSinceLastBirthday, 0);
  assert.equal(stats.hoursRemainder, 8);
  assert.equal(stats.minutesRemainder, 15);
});

test('extractMonogram produces clean two-letter initials', () => {
  assert.equal(extractMonogram('Nadia Putri'), 'NP');
  assert.equal(extractMonogram('[NAMA PENERIMA]'), 'NP');
  assert.equal(extractMonogram('Raka'), 'RA');
});
