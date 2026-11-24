import type { BirthdayConfig, WishEntry } from '../data/birthdayConfig';

export interface WishFormInput {
  name: string;
  relation: string;
  message: string;
}

export interface WishValidationErrors {
  name?: string;
  message?: string;
}

export function validateWishInput(input: WishFormInput): WishValidationErrors {
  const errors: WishValidationErrors = {};
  const trimmedName = input.name.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedName.length === 0) {
    errors.name = 'Tuliskan namamu terlebih dahulu';
  } else if (trimmedName.length > 60) {
    errors.name = 'Nama maksimal 60 karakter';
  }

  if (trimmedMessage.length < 8) {
    errors.message = 'Ucapan minimal 8 karakter';
  } else if (trimmedMessage.length > 600) {
    errors.message = 'Ucapan maksimal 600 karakter';
  }

  return errors;
}

export function hasValidationErrors(errors: WishValidationErrors): boolean {
  return Boolean(errors.name || errors.message);
}

export function normalizeConfig(
  raw: unknown,
  fallback: BirthdayConfig
): BirthdayConfig {
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }
  const obj = raw as Record<string, unknown>;
  const letterBody = Array.isArray(obj.letterBody)
    ? obj.letterBody.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : fallback.letterBody;

  return {
    celebrantName:
      typeof obj.celebrantName === 'string' && obj.celebrantName.trim()
        ? obj.celebrantName
        : fallback.celebrantName,
    turningAge:
      typeof obj.turningAge === 'string' && obj.turningAge.trim()
        ? obj.turningAge
        : fallback.turningAge,
    birthplace:
      typeof obj.birthplace === 'string' && obj.birthplace.trim()
        ? obj.birthplace
        : fallback.birthplace,
    birthdate:
      typeof obj.birthdate === 'string' && obj.birthdate.trim()
        ? obj.birthdate
        : fallback.birthdate,
    senderName:
      typeof obj.senderName === 'string' && obj.senderName.trim()
        ? obj.senderName
        : fallback.senderName,
    coverHeaderLine:
      typeof obj.coverHeaderLine === 'string' && obj.coverHeaderLine.trim()
        ? obj.coverHeaderLine
        : fallback.coverHeaderLine,
    coverSubtitle:
      typeof obj.coverSubtitle === 'string' && obj.coverSubtitle.trim()
        ? obj.coverSubtitle
        : fallback.coverSubtitle,
    heroOpeningLine:
      typeof obj.heroOpeningLine === 'string' && obj.heroOpeningLine.trim()
        ? obj.heroOpeningLine
        : fallback.heroOpeningLine,
    portraitUrl:
      typeof obj.portraitUrl === 'string' && obj.portraitUrl.trim()
        ? obj.portraitUrl
        : fallback.portraitUrl,
    portraitCaption:
      typeof obj.portraitCaption === 'string' && obj.portraitCaption.trim()
        ? obj.portraitCaption
        : fallback.portraitCaption,
    dedicationParagraph:
      typeof obj.dedicationParagraph === 'string' && obj.dedicationParagraph.trim()
        ? obj.dedicationParagraph
        : fallback.dedicationParagraph,
    dedicationClosingPhrase:
      typeof obj.dedicationClosingPhrase === 'string' && obj.dedicationClosingPhrase.trim()
        ? obj.dedicationClosingPhrase
        : fallback.dedicationClosingPhrase,
    letterSalutation:
      typeof obj.letterSalutation === 'string' && obj.letterSalutation.trim()
        ? obj.letterSalutation
        : fallback.letterSalutation,
    letterBody: letterBody.length > 0 ? letterBody : fallback.letterBody,
    letterClosing:
      typeof obj.letterClosing === 'string' && obj.letterClosing.trim()
        ? obj.letterClosing
        : fallback.letterClosing,
    surpriseTitle:
      typeof obj.surpriseTitle === 'string' && obj.surpriseTitle.trim()
        ? obj.surpriseTitle
        : fallback.surpriseTitle,
    surpriseSubtitle:
      typeof obj.surpriseSubtitle === 'string' && obj.surpriseSubtitle.trim()
        ? obj.surpriseSubtitle
        : fallback.surpriseSubtitle,
    surpriseNote:
      typeof obj.surpriseNote === 'string' && obj.surpriseNote.trim()
        ? obj.surpriseNote
        : fallback.surpriseNote,
    customAudioName:
      typeof obj.customAudioName === 'string' ? obj.customAudioName : null,
  };
}

export function normalizeWishes(raw: unknown): WishEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((item): item is WishEntry => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.name === 'string' &&
      typeof candidate.relation === 'string' &&
      typeof candidate.message === 'string' &&
      typeof candidate.createdAt === 'string'
    );
  });
}

export function parseLetterTextToParagraphs(rawText: string): string[] {
  return rawText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
