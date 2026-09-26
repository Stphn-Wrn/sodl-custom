const FAVORITE_TARGETS = {
  rollWeapon: "itemId",
  castSpell: "itemId",
  useTalent: "itemId",
  useItem: "itemId",
  rollChallenge: "attribute",
  postRule: "ruleRef",
  spendFortune: "useIndex",
  toggleStatus: "statusId",
  toggleEffect: "effectId",
  toggleWear: "itemId"
};

export function arrange(ids, { order = [], hidden = [] }) {
  const known = order.filter((id) => ids.includes(id));
  const ordered = [...known, ...ids.filter((id) => !known.includes(id))];
  return {
    visible: ordered.filter((id) => !hidden.includes(id)),
    hidden: ordered.filter((id) => hidden.includes(id))
  };
}

export function moveBefore(ids, movedId, targetId) {
  const without = ids.filter((id) => id !== movedId);
  const targetIndex = without.indexOf(targetId);
  if (targetIndex < 0) {
    return [...without, movedId];
  }
  return [...without.slice(0, targetIndex), movedId, ...without.slice(targetIndex)];
}

export function toggle(list, id) {
  if (list.includes(id)) {
    return list.filter((item) => item !== id);
  }
  return [...list, id];
}

export function entryKey(entry) {
  const field = FAVORITE_TARGETS[entry.action?.type];
  if (!field) {
    return null;
  }
  return `${entry.action.type}:${entry.action[field]}`;
}

export function pickFavorites(entries, keys) {
  return keys
    .map((key) => entries.find((entry) => entryKey(entry) === key))
    .filter(Boolean);
}
