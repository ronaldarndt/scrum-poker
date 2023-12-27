import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { nanoid } from "nanoid/non-secure";

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

const defaultUser = {
  name: "",
  id: nanoid(),
};

interface User {
  name: string;
  id: string;
}

const storage =
  typeof localStorage === "undefined" || localStorage === null
    ? emulatedStorage
    : localStorage;

const savedUser = storage.getItem("user");

export const userAtom = atomWithStorage<User>(
  "user",
  savedUser ? JSON.parse(savedUser) : defaultUser,
  createJSONStorage(() => storage),
);
