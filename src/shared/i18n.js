const KEY_PREFIX = "SODL.";

function lookup(dictionary, key) {
  return key.split(".").reduce((node, part) => node?.[part], dictionary);
}

function interpolate(text, data) {
  return text.replace(/\{(\w+)\}/g, (match, name) => {
    if (data[name] === undefined) {
      return match;
    }
    return String(data[name]);
  });
}

export function createTranslator(dictionary) {
  return (key, data = {}) => {
    const text = lookup(dictionary, key);
    if (typeof text !== "string") {
      return key;
    }
    return interpolate(text, data);
  };
}

export function localizeTree(value, t) {
  if (Array.isArray(value)) {
    return value.map((item) => localizeTree(item, t));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeTree(item, t)]));
  }
  if (typeof value === "string" && value.startsWith(KEY_PREFIX)) {
    return t(value);
  }
  return value;
}

export class LocalizedError extends Error {
  constructor(key, data = {}) {
    super(key);
    this.data = data;
  }
}
