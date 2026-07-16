import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    pool: "forks",
    poolOptions: {
      forks: {
        execArgv: ["--max-old-space-size=4096"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
