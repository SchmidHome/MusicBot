import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      preprocess: preprocess({
        scss: {
          prependData: `@use "src/variables.sass" as *;`,
        },
        sass: {
          prependData: `@use "src/variables.sass" as *`,
        },
      }),
    }),
  ],
  envPrefix: "PUBLIC_",
  resolve: {
    alias: {
      "/": path.resolve("./src"),
      assets: path.resolve("./src/assets"),
      components: path.resolve("./src/components"),
      global: path.resolve("./src/global"),
    },
  },
});
