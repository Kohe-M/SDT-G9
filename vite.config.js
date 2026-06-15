import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // loadEnvで.env.localを含むすべての環境変数を読み込む
  const env = loadEnv(mode, process.cwd(), "");
  // Firebase Hosting: .env.localにVITE_BASE_PATH=/ を設定
  // GitHub Pages: デフォルトで /SDT-G9/
  const base = env.VITE_BASE_PATH || (command === "build" ? "/SDT-G9/" : "/");
  return {
    base,
    plugins: [react()],
    test: {
      environment: "jsdom",
    },
  };
});
