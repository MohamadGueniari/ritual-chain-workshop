import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// When building for GitHub Pages the app is served from a sub-path. Set the base
// only in that build via BUILD_FOR_PAGES=1 so local dev keeps working at root.
const isPages = process.env.BUILD_FOR_PAGES === "1";
const base = isPages ? process.env.PAGES_BASE_PATH ?? "/ritual-chain-workshop/" : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
