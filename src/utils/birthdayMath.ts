export interface BirthdayTimeStats {
  isValid: boolean;
  yearsLived: number;
  daysSinceLastBirthday: number;
  hoursRemainder: number;
  minutesRemainder: number;
  totalDaysLived: number;
  daysUntilNextBirthday: number;
  hoursUntilNextBirthday: number;
  minutesUntilNextBirthday: number;
  isBirthdayToday: boolean;
  upcomingAge: number;
  formattedBirthdate: string;
}

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function parseBirthdate(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const probe = new Date(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function formatIndonesianDate(isoDate: string): string {
  const parsed = parseBirthdate(isoDate);
  if (!parsed) {
    return 'Tanggal belum diatur';
  }
  return `${parsed.day} ${INDONESIAN_MONTHS[parsed.month - 1]} ${parsed.year}`;
}

function resolveBirthdayInYear(year: number, month: number, day: number): Date {
  // Map Feb 29 onto Feb 28 in non-leap years so countdown never drifts into March.
  const candidate = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (candidate.getMonth() !== month - 1) {
    return new Date(year, month - 1, 28, 0, 0, 0, 0);
  }
  return candidate;
}

export function calculateBirthdayStats(birthdateIso: string, now: Date = new Date()): BirthdayTimeStats {
  const parsed = parseBirthdate(birthdateIso);
  if (!parsed) {
    return {
      isValid: false,
      yearsLived: 0,
      daysSinceLastBirthday: 0,
      hoursRemainder: 0,
      minutesRemainder: 0,
      totalDaysLived: 0,
      daysUntilNextBirthday: 0,
      hoursUntilNextBirthday: 0,
      minutesUntilNextBirthday: 0,
      isBirthdayToday: false,
      upcomingAge: 0,
      formattedBirthdate: 'Tanggal belum diatur',
    };
  }

  const birthDate = new Date(parsed.year, parsed.month - 1, parsed.day, 0, 0, 0, 0);
  const formattedBirthdate = formatIndonesianDate(birthdateIso);

  if (now.getTime() < birthDate.getTime()) {
    const diffMs = birthDate.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const daysUntil = Math.floor(totalMinutes / (60 * 24));
    const hoursUntil = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutesUntil = totalMinutes % 60;
    return {
      isValid: true,
      yearsLived: 0,
      daysSinceLastBirthday: 0,
      hoursRemainder: 0,
      minutesRemainder: 0,
      totalDaysLived: 0,
      daysUntilNextBirthday: daysUntil,
      hoursUntilNextBirthday: hoursUntil,
      minutesUntilNextBirthday: minutesUntil,
      isBirthdayToday: false,
      upcomingAge: 0,
      formattedBirthdate,
    };
  }

  const currentYear = now.getFullYear();
  const thisYearBirthday = resolveBirthdayInYear(currentYear, parsed.month, parsed.day);
  const isBirthdayToday =
    now.getFullYear() === thisYearBirthday.getFullYear() &&
    now.getMonth() === thisYearBirthday.getMonth() &&
    now.getDate() === thisYearBirthday.getDate();

  let lastBirthday: Date;
  let nextBirthday: Date;
  let yearsLived: number;

  if (now.getTime() >= thisYearBirthday.getTime()) {
    lastBirthday = thisYearBirthday;
    nextBirthday = resolveBirthdayInYear(currentYear + 1, parsed.month, parsed.day);
    yearsLived = currentYear - parsed.year;
  } else {
    lastBirthday = resolveBirthdayInYear(currentYear - 1, parsed.month, parsed.day);
    nextBirthday = thisYearBirthday;
    yearsLived = currentYear - parsed.year - 1;
  }

  const sinceLastMs = Math.max(0, now.getTime() - lastBirthday.getTime());
  const sinceLastMinutes = Math.floor(sinceLastMs / 60000);
  const daysSinceLastBirthday = Math.floor(sinceLastMinutes / (60 * 24));
  const hoursRemainder = Math.floor((sinceLastMinutes % (60 * 24)) / 60);
  const minutesRemainder = sinceLastMinutes % 60;

  const totalDaysLived = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

  const untilNextMs = Math.max(0, nextBirthday.getTime() - now.getTime());
  const untilNextMinutes = Math.floor(untilNextMs / 60000);
  const daysUntilNextBirthday = Math.floor(untilNextMinutes / (60 * 24));
  const hoursUntilNextBirthday = Math.floor((untilNextMinutes % (60 * 24)) / 60);
  const minutesUntilNextBirthday = untilNextMinutes % 60;

  return {
    isValid: true,
    yearsLived,
    daysSinceLastBirthday,
    hoursRemainder,
    minutesRemainder,
    totalDaysLived,
    daysUntilNextBirthday,
    hoursUntilNextBirthday,
    minutesUntilNextBirthday,
    isBirthdayToday,
    upcomingAge: yearsLived + 1,
    formattedBirthdate,
  };
}

export function resolveDisplayAge(turningAgeInput: string, stats: BirthdayTimeStats): string {
  const trimmed = turningAgeInput.trim();
  if (!trimmed || trimmed === '[USIA]') {
    return trimmed || (stats.isValid ? String(stats.yearsLived) : '[USIA]');
  }
  return trimmed;
}

export function extractMonogram(name: string): string {
  const cleaned = name.replace(/[[\]]/g, '').trim();
  if (!cleaned) {
    return 'MU';
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
