import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { storage } from "./common";

interface Preferences {
  animations: boolean;
  confetti: boolean;
}

const defaultPreferences = {
  animations: true,
  confetti: true,
};

const saved = storage.getItem("prefs");

export const preferencesAtom = atomWithStorage<Preferences>(
  "prefs",
  saved ? JSON.parse(saved) : defaultPreferences,
  createJSONStorage(() => storage),
);
