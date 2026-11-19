import type {Point} from './hero-launch';

// The sphere crosses the horizontal metal rim at the antenna socket. Clip
// the part below that plane; the centre continues on the original diagonal.
export function antennaEntry(from: Point, rim: Point, radius: number, t: number) {
  const sink = radius + 1;
  const dy = rim.y - from.y;
  const extend = sink / Math.max(1, dy);
  const u = t * (1 + extend);
  const x = from.x + (rim.x - from.x) * u;
  const y = from.y + dy * u;
  const hidden = Math.max(0, Math.min(1, (y + radius - rim.y) / (2 * radius)));
  return { x, y, hidden };
}
