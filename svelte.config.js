import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({
    scss: {
      prependData: `@use "./src/scss/abstracts" as *;`,
    },
  }),
  compilerOptions: {
    runes: true,
  },
};

export default config;
