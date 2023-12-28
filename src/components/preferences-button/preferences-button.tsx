import { preferencesAtom } from "@/atoms/preferences";
import { Menu, Switch, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useAtom } from "jotai";
import { Fragment } from "react";

type A = ReturnType<(typeof preferencesAtom)["read"]>;

const map: Record<keyof A, string> = {
  animations: "Animations",
  confetti: "Confetti",
};

export default function PreferencesButton() {
  const [prefs, setPrefs] = useAtom(preferencesAtom);

  return (
    <Menu as="div" className="relative inline-block ">
      <div>
        <Menu.Button className="i-ph-dots-three-vertical text-xl p-2"></Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-2">
          {Object.keys(prefs).map((key) => {
            const enabled = prefs[key as keyof A];
            const text = map[key as keyof A];

            return (
              <Menu.Item key={key}>
                {({ active }) => (
                  <Switch.Group
                    as="a"
                    href="#"
                    className={clsx(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm flex flex-row justify-between",
                    )}
                  >
                    <Switch.Label className="text-inverted me-1">
                      {text}
                    </Switch.Label>
                    <Switch
                      checked={enabled}
                      onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                      className={`${
                        enabled ? "bg-blue-600" : "bg-gray-200"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          enabled ? "translate-x-2" : "-translate-x-2"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </Switch.Group>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
