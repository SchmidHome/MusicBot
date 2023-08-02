import adapter from "@sveltejs/adapter-auto";
import sveltePreprocess from "svelte-preprocess";
import path from "path";
import { fileURLToPath } from "url";

const filePath = path.dirname(fileURLToPath(import.meta.url));
const sassPath = `${
  // remove drive letter
  filePath.split(":", 2)[1].replace(/\\/g, "/")
}/src/_variables.sass`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      prependData: `@use '${sassPath}' as *;`,
    },
    sass: {
      prependData: `@use "${sassPath}" as *`,
    },
  }),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      // "/": "./src",
      $assets: "./src/assets",
      $data: "./src/data",
      $lib: "./src/lib",
    },
  },
};

export default config;
