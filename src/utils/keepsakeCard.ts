export interface KeepsakeCardPayload {
  celebrantName: string;
  turningAge: string;
  senderName: string;
  surpriseTitle: string;
  surpriseSubtitle: string;
  surpriseNote: string;
  wishText?: string;
  isDark: boolean;
}

export function buildKeepsakeFilename(celebrantName: string): string {
  const slug = celebrantName
    .replace(/[[\]]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `kartu-kejutan-${slug}.png` : 'kartu-kejutan-ulang-tahun.png';
}

export function wrapTextLines(
  text: string,
  maxCharsPerLine: number,
  maxLines = 4
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || current.length === 0) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

export function renderKeepsakeCardToDataUrl(payload: KeepsakeCardPayload): string {
  const width = 1200;
  const height = 760;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  const palette = payload.isDark
    ? {
        canvas: '#131619',
        surface: '#1C2126',
        ink: '#F2F3EE',
        muted: '#A5AEB8',
        border: '#2D343C',
        accent: '#E6A0B2',
        accentInk: '#131619',
      }
    : {
        canvas: '#F6F7F4',
        surface: '#EBEDE7',
        ink: '#14181D',
        muted: '#4A545E',
        border: '#D4D9D2',
        accent: '#7D223C',
        accentInk: '#F6F7F4',
      };

  // Outer archival paper background.
  ctx.fillStyle = palette.canvas;
  ctx.fillRect(0, 0, width, height);

  // Inner ticket surface with crisp hairline border.
  const pad = 48;
  ctx.fillStyle = palette.surface;
  ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Inner fine archival frame.
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(pad + 18, pad + 18, width - (pad + 18) * 2, height - (pad + 18) * 2);

  // Header metadata row.
  const contentX = pad + 60;
  ctx.fillStyle = palette.muted;
  ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Kejutan Terakhir, Edisi Ulang Tahun', contentX, pad + 84);

  const dateText = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  ctx.textAlign = 'right';
  ctx.fillText(dateText, width - contentX, pad + 84);
  ctx.textAlign = 'left';

  // Top hairline divider.
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, pad + 114);
  ctx.lineTo(width - contentX, pad + 114);
  ctx.stroke();

  // Accent recipient caption.
  ctx.fillStyle = palette.accent;
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Untuk ${payload.celebrantName}, usia ${payload.turningAge}`,
    contentX,
    pad + 178
  );

  // Sculptural serif voucher headline.
  ctx.fillStyle = palette.ink;
  ctx.font = '500 54px "Fraunces", Georgia, serif';
  const titleLines = wrapTextLines(payload.surpriseTitle, 32, 2);
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, contentX, pad + 252 + idx * 66);
  });

  // Subtitle line.
  const subtitleY = pad + 252 + titleLines.length * 66 + 18;
  ctx.fillStyle = palette.muted;
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(payload.surpriseSubtitle, contentX, subtitleY);

  // Note body text.
  ctx.fillStyle = palette.ink;
  ctx.font = '400 23px "Plus Jakarta Sans", sans-serif';
  const noteLines = wrapTextLines(payload.surpriseNote, 62, 3);
  noteLines.forEach((line, idx) => {
    ctx.fillText(line, contentX, subtitleY + 56 + idx * 36);
  });

  // Optional private wish whisper.
  if (payload.wishText && payload.wishText.trim().length > 0) {
    ctx.fillStyle = palette.muted;
    ctx.font = 'italic 22px "Fraunces", Georgia, serif';
    const wishLines = wrapTextLines(`Harapan hari ini: "${payload.wishText.trim()}"`, 62, 2);
    wishLines.forEach((line, idx) => {
      ctx.fillText(line, contentX, height - pad - 152 + idx * 30);
    });
  }

  // Footer divider & attribution.
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, height - pad - 102);
  ctx.lineTo(width - contentX, height - pad - 102);
  ctx.stroke();

  ctx.fillStyle = palette.muted;
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Diterbitkan khusus oleh', contentX, height - pad - 62);

  ctx.fillStyle = palette.ink;
  ctx.font = '500 30px "Fraunces", Georgia, serif';
  ctx.fillText(payload.senderName, contentX, height - pad - 28);

  // Subtle seal circle on bottom right.
  const sealX = width - contentX - 36;
  const sealY = height - pad - 48;
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.accentInk;
  ctx.font = '600 20px "Fraunces", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const sealInitials = payload.senderName
    .replace(/[[\]]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || 'KT';
  ctx.fillText(sealInitials, sealX, sealY + 1);

  return canvas.toDataURL('image/png');
}

export function downloadKeepsakeCardPng(payload: KeepsakeCardPayload): boolean {
  const dataUrl = renderKeepsakeCardToDataUrl(payload);
  if (!dataUrl) {
    return false;
  }
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = buildKeepsakeFilename(payload.celebrantName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
