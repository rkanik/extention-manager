import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { copyFileSync, readdirSync, existsSync } from "fs";

export default defineConfig({
  plugins: [vue()],
  publicDir: "public",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background.js"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
