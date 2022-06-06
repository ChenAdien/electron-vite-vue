import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "../dist/main",
    emptyOutDir: true,
    minify: process.env.NODE_ENV === "production",
    lib: {
      entry: "main.ts",
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
  },
});
