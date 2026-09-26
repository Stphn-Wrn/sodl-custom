const ARMED_TTL_MS = 2000;

const LIMITS = {
  boons: 5,
  modifier: 10
};

export const DEFAULT_ROLL_OPTIONS = { boons: 0, modifier: 0 };

export function armRoll(options, now) {
  return { ...options, expiresAt: now + ARMED_TTL_MS };
}

export function takeArmedRoll(armed, now) {
  if (!armed || now > armed.expiresAt) {
    return null;
  }
  return { boons: armed.boons, modifier: armed.modifier };
}

export function stepRollOption(key, value, delta) {
  const limit = LIMITS[key];
  return Math.min(limit, Math.max(-limit, value + delta));
}
