import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import preprocess from "svelte-preprocess";

export default defineConfig({
  plugins: [sveltekit()],
  envPrefix: "PUBLIC_",
  server: {
    watch: {
      ignored: ["**"],
    },
  },
});
