const map = new Map<string, string>();

const emulatedStorage = {
  getItem(key: string) {
    return map.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    map.set(key, value);
  },
  removeItem(key: string) {
    map.delete(key);
  },
};

export const storage =
  typeof localStorage === "undefined" || localStorage === null
    ? emulatedStorage
    : localStorage;
