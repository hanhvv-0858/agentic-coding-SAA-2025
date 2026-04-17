import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` throws by design when imported outside an RSC build.
      // Tests run in plain Node — alias to a harmless empty module.
      "server-only": path.resolve(__dirname, "./tests/setup/server-only.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["src/**/*.spec.{ts,tsx}", "tests/unit/**/*.spec.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**", ".open-next/**"],
  },
});
