import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  name: string;
  id: string;
  set: (
    partial:
      | UserStore
      | Partial<UserStore>
      | ((state: UserStore) => UserStore | Partial<UserStore>),
    replace?: false,
  ) => void;
}

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      name: "",
      id: nanoid(),
      set,
    }),
    { name: "user-store" },
  ),
);
