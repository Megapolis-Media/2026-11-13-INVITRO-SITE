type TicketPrint = {
  number: string;
  backdrop: string;
  name?: string;
  earned?: boolean;
  region?: string;
  clipId?: string;
  embeddedFontCSS?: string;
};

function xml(value: string) {
  return value.replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[ch]!));
}

function fittedLine(value: string, width: number, preferredSize: number, y: number, color: string, weight: number) {
  const size = Math.min(preferredSize, width / Math.max(1, [...value].length * .64));
  return `<text x="47" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${xml(value)}</text>`;
}

/** Screen, print and mail share one die line, number layout and personalized type. */
export function ticketArtwork({number, backdrop, name = '', earned = false, region = '', clipId = 'ticket-cut', embeddedFontCSS = ''}: TicketPrint) {
  const digits = number.match(/^(\d{2})\s*[-–—]?\s*(\d{3})$/);
  const label = digits ? digits[1] + digits[2] : number;
  const ink = '#004b60';
  const silhouette = 'M29 0H818a6 6 0 0 0 12 0H1251Q1280 0 1280 29V299a21 21 0 0 0 0 42V611Q1280 640 1251 640H830a6 6 0 0 0-12 0H29Q0 640 0 611V341a21 21 0 0 0 0-42V29Q0 0 29 0Z';
  const personalized = Boolean(name.trim() || region.trim());
  const printedNumber = digits
    ? `<text x="39" y="${personalized ? 503 : 570}" font-size="${personalized ? 159 : 195}" font-weight="700" letter-spacing="-4" fill="${ink}">${label}</text>`
    : fittedLine(number, 715, 93, 487, ink, 700);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="640" viewBox="0 0 1280 640" role="img" aria-label="${xml('Новогодний телецентр INVITRO. Билет '+label+'. 23 декабря, 12:00 МСК. invitrotv.ru')}">
  <title>${xml('Новогодний телецентр INVITRO · '+label)}</title>
  <defs>${embeddedFontCSS ? `<style>${embeddedFontCSS}</style>` : ''}<clipPath id="${xml(clipId)}"><path d="${silhouette}"/></clipPath></defs>
  <g clip-path="url(#${xml(clipId)})" font-family="'Code Next', sans-serif">
    <image width="1280" height="640" xlink:href="${xml(backdrop)}"/>
    <text x="47" y="${personalized ? 376 : 403}" fill="${ink}" font-weight="700" font-size="28" letter-spacing="2">${earned ? 'БИЛЕТ ЗА АКТИВНОСТЬ' : 'ЛОТЕРЕЙНЫЙ БИЛЕТ'}</text>
    ${printedNumber}
    <path d="M824 13V627" fill="none" stroke="#abd2d9" stroke-width="1.8" stroke-dasharray="5 9"/>
    ${personalized ? '<path d="M47 528H767" fill="none" stroke="#bcdde1" stroke-width="2" stroke-dasharray="8 8"/>' : ''}
    ${name.trim() ? fittedLine(name.trim(), 720, 36, 576, ink, 700) : ''}
    ${region.trim() ? fittedLine(region.trim(), 720, 28, 612, '#346375', 400) : ''}
    <g fill="#003c50" text-anchor="middle">
      <text x="1054" y="594" font-weight="700" font-size="30">23 ДЕКАБРЯ · 12:00 МСК</text>
      <text x="1054" y="629" font-size="34" font-weight="700">invitrotv.ru</text>
    </g>
  </g></svg>`;
}
