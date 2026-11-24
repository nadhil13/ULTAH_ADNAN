import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKeepsakeFilename, wrapTextLines } from './keepsakeCard';

test('buildKeepsakeFilename creates clean kebab-case PNG filename', () => {
  assert.equal(buildKeepsakeFilename('Nadia Larasati'), 'kartu-kejutan-nadia-larasati.png');
  assert.equal(buildKeepsakeFilename('[NAMA PENERIMA]'), 'kartu-kejutan-nama-penerima.png');
  assert.equal(buildKeepsakeFilename('   '), 'kartu-kejutan-ulang-tahun.png');
});

test('wrapTextLines splits prose cleanly within line length and line count budgets', () => {
  const lines = wrapTextLines(
    'Kupon Makan Malam dan Jalan Jalan Pilihanmu di Akhir Pekan',
    24,
    3
  );
  assert.ok(lines.length <= 3);
  assert.equal(lines[0], 'Kupon Makan Malam dan');
  assert.deepEqual(wrapTextLines('   ', 20), []);
});
