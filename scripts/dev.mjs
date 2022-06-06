import { createServer, build } from "vite";
import { spawn } from "child_process";
import path from "path";
import crossEnv from "cross-env";
import electron from "electron";
const __dirname = path.resolve();
const server = await createServer({
  configFile: path.resolve(__dirname, "./vite.config.ts"),
});
const { config } = await server.listen();
server.printUrls();
let electronProcess = null;
await build({
  configFile: path.resolve(__dirname, "./electron/vite.config.ts"),
  mode: "development",
  plugins: [
    {
      name: "electron-preload-watcher",
      writeBundle() {
        server.ws.send({ type: "full-reload" }); // 构建完成时强制刷新页面
      },
    },
  ],
  build: {
    lib: {
      entry: "preload.ts", // 预加载脚本的入口
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    sourcemap: "inline",
    watch: {}, // 监听变动
  },
});
await build({
  configFile: path.resolve(__dirname, "./electron/vite.config.ts"),
  mode: "development",
  plugins: [
    {
      name: "electron-main-watcher",
      writeBundle() {
        const env = Object.assign(process.env, {
          VITE_PORT: config.server.port,
        });
        if (electronProcess) {
          electronProcess.removeAllListeners();
          electronProcess.kill(); // 关闭electron进程
        }
        // 开启新的electron进程
        electronProcess = spawn(electron, ["."]);
        // 关闭electron的时候同时关闭主进程
        electronProcess.once("exit", process.exit);
        electronProcess.stdout.on("data", (data) => {
          const str = data.toString().trim();
          str && console.log(str);
        });
        electronProcess.stderr.on("data", (data) => {
          const str = data.toString().trim();
          str && console.error(str);
        });
      },
    },
  ],
  build: {
    lib: {
      entry: "main.ts",
      formats: ["cjs"],
      fileName: () => "[name].cjs",
    },
    emptyOutDir: false, // 不清空文件夹 避免清除掉preload.cjs
    watch: {}, // 监听变动
  },
});
