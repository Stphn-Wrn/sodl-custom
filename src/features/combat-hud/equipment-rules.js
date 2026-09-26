const HAND_CAPACITY = 2;

const KIND = {
  MAIN: "main",
  OFF: "off",
  TWO_HANDED: "two",
  BODY_ARMOR: "body"
};

function kindOf(item) {
  if (item.type === "armor") {
    if (item.isShield) {
      return KIND.OFF;
    }
    return KIND.BODY_ARMOR;
  }
  if (item.hands === "two") {
    return KIND.TWO_HANDED;
  }
  if (item.hands === "off") {
    return KIND.OFF;
  }
  return KIND.MAIN;
}

function handsNeeded(kind) {
  if (kind === KIND.TWO_HANDED) {
    return HAND_CAPACITY;
  }
  if (kind === KIND.BODY_ARMOR) {
    return 0;
  }
  return 1;
}

function isHandKind(kind) {
  return kind !== KIND.BODY_ARMOR;
}

function totalHands(items) {
  return items.reduce((sum, item) => sum + handsNeeded(kindOf(item)), 0);
}

function handConflicts(wornInHands, targetKind) {
  if (targetKind === KIND.TWO_HANDED) {
    return wornInHands;
  }

  const dropped = wornInHands.filter((item) => kindOf(item) === KIND.TWO_HANDED);
  if (targetKind === KIND.OFF) {
    dropped.push(...wornInHands.filter((item) => kindOf(item) === KIND.OFF));
  }

  const kept = wornInHands.filter((item) => !dropped.includes(item));

  const candidates = [
    ...kept.filter((item) => kindOf(item) === targetKind).reverse(),
    ...kept.filter((item) => kindOf(item) !== targetKind).reverse()
  ];
  for (const candidate of candidates) {
    if (totalHands(kept) + handsNeeded(targetKind) <= HAND_CAPACITY) {
      break;
    }
    kept.splice(kept.indexOf(candidate), 1);
    dropped.push(candidate);
  }
  return dropped;
}

export function planEquip(items, targetId) {
  const target = items.find((item) => item.id === targetId);
  if (!target || target.worn) {
    return [];
  }

  const targetKind = kindOf(target);
  const others = items.filter((item) => item.worn && item.id !== targetId);
  let dropped = [];
  if (isHandKind(targetKind)) {
    dropped = handConflicts(others.filter((item) => isHandKind(kindOf(item))), targetKind);
  } else {
    dropped = others.filter((item) => kindOf(item) === KIND.BODY_ARMOR);
  }

  const changes = items
    .filter((item) => dropped.includes(item))
    .map((item) => ({ id: item.id, worn: false }));
  changes.push({ id: targetId, worn: true });
  return changes;
}

export function planUnequip(items, targetId) {
  const target = items.find((item) => item.id === targetId);
  if (!target || !target.worn) {
    return [];
  }
  return [{ id: targetId, worn: false }];
}
