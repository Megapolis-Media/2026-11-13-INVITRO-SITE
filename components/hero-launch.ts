export type Point = { x: number; y: number };
export const unit = (n: number) => Math.max(0, Math.min(1, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function line(from: Point, to: Point, t: number): Point {
  return { x: mix(from.x, to.x, t), y: mix(from.y, to.y, t) };
}

// The only curve is inside the manufactured chute. Outside its lip both
// strokes are straight in page coordinates, at every scroll position.
export function downChute(outlet: Point, lip: Point, progress: number): Point {
  const u = unit(progress);
  return { x: mix(outlet.x, lip.x, u * u), y: mix(outlet.y, lip.y, u * (2 - u)) };
}

// Advance on the first gesture, carry on between scroll samples and reach
// the next prop when its action is visible above the dock.
export function legClock(elapsed: number, duration: number, scroll: number, launchScroll: number,
                         startY: number, endY: number, screenLimit: number, height: number) {
  const arriving = endY - screenLimit;
  const scrollProgress = arriving <= launchScroll ? 1 : unit((scroll - launchScroll) / (arriving - launchScroll));
  const available = unit((scroll + screenLimit - startY) / Math.max(1, endY - startY));
  const clock = unit(elapsed / duration);
  const coast = available * clock;
  const close = unit((scroll + screenLimit - endY + .18 * height) / (.18 * height));
  const hurry = unit((scroll - arriving) / (.4 * height));
  const minimumTime = mix(duration * .47, 100, hurry);
  return Math.min(unit(elapsed / minimumTime),
    Math.max(scrollProgress, Math.min(coast, .44 + .56 * Math.max(scrollProgress, close))));
}

// After contact the ball owns this stroke. Scroll can advance it, but a finger
// lifted at impact cannot leave it suspended between the cabinets.
export function reboundClock(elapsed: number, scrollDelta: number, distance: number, fullMotion: boolean) {
  const duration = fullMotion ? Math.max(300, Math.min(540, distance / 1.12)) : 250;
  return unit(elapsed / duration + .22 * Math.max(0, scrollDelta) / Math.max(1, distance));
}
