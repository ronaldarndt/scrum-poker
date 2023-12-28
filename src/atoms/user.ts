import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { nanoid } from "nanoid/non-secure";
import { storage } from "./common";

interface User {
  name: string;
  id: string;
}

const defaultUser = {
  name: "",
  id: nanoid(),
};

const savedUser = storage.getItem("user");

export const userAtom = atomWithStorage<User>(
  "user",
  savedUser ? JSON.parse(savedUser) : defaultUser,
  createJSONStorage(() => storage),
);
