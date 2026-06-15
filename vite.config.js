import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // GitHub Pages: /SDT-G9/  Firebase Hosting: /  (VITE_BASE_PATH=/ を設定)
  base: process.env.VITE_BASE_PATH ?? (command === "build" ? "/SDT-G9/" : "/"),
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
}));
