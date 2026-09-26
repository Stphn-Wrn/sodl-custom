export function adjustUsed({ used, max }, delta) {
  return Math.min(max, Math.max(0, used - delta));
}
