import {
  defineConfig,
  presetIcons,
  presetUno,
  transformerDirectives,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno({ dark: "media" }),
    presetIcons({
      collections: {
        ph: () => import("@iconify-json/ph/icons.json").then((x) => x.default),
      },
    }),
  ],
  shortcuts: {
    btn: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
    title: "text-2xl font-bold",
    text: "text-gray-700 dark:text-gray-300",
    "text-inverted": "text-gray-300 dark:text-gray-700",
  },
  transformers: [
    transformerDirectives({
      applyVariable: ["--uno"],
    }),
  ],
});
