import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    // XP.css ships selectors that lightningcss refuses to minify.
    cssMinify: false,
  },
  test: {
    environment: "jsdom",
  },
});
