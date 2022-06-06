import { build } from "vite";
import path from "path";
const __dirname = path.resolve();
await build({
  configFile: path.resolve(__dirname, "./electron/vite.config.ts"),
  mode: "production",
  build: {
    lib: {
      entry: "preload.ts", // 预加载脚本的入口
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    sourcemap: "inline",
  },
});
await build({
  configFile: path.resolve(__dirname, "./electron/vite.config.ts"),
  mode: "production",
  build: {
    lib: {
      entry: "main.ts",
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    emptyOutDir: false, // 不清空文件夹 避免清除掉preload.cjs
  },
});
process.exit();
