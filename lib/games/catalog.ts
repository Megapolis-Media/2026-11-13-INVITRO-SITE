import {WORDS} from './words';
import {MELODIES} from './melodies';

export const playable = {yak: WORDS, pelsh: MELODIES.filter(q => q.ready && q.audio)};
export const requiredIds = {
  yak: playable.yak.map(q => q.id),
  pelsh: MELODIES.map(q => q.id),
};

export function gameProgress(rows: {game: string; question: string}[]) {
  const count = (game: keyof typeof playable) => {
    const solved = new Set(rows.filter(r => r.game === game).map(r => r.question));
    return {solved: requiredIds[game].filter(id => solved.has(id)).length, total: requiredIds[game].length};
  };
  return {yak: count('yak'), pelsh: count('pelsh')};
}
