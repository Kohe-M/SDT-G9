import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/SDT-G9/",
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
