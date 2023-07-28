import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      scss: {
        prependData: '@use "frontend/src/variables.sass" as *;',
      },
      sass: {
        prependData: '@use "frontend/src/variables.sass" as *',
      },
    }),
  ],
};

export default config;
