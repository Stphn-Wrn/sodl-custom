/**
 * Correction manuelle des utilisations limitées (incantations d'un sort,
 * utilisations d'un talent). Le système compte les utilisations *consommées* ;
 * `delta` est exprimé en utilisations *restantes* : +1 en rend une, -1 en retire une.
 */
export function adjustUsed({ used, max }, delta) {
  return Math.min(max, Math.max(0, used - delta));
}
