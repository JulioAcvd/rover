import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ command }) => ({
  root: "demo",
  base: "./",
  resolve: {
    // The dev server uses the source; the demo build consumes the compiled package like any user would.
    alias: {
      "xp-rover": fromRoot(command === "serve" ? "./src/index.ts" : "./dist/index.js"),
    },
  },
  build: {
    outDir: "../demo-dist",
    emptyOutDir: true,
    // XP.css ships selectors that lightningcss refuses to minify.
    cssMinify: false,
  },
}));
