import react from "@vitejs/plugin-react"
import path from "path"
import svgr from "vite-plugin-svgr"
import { coverageConfigDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      exclude: ["**/*.config.*", "**/services/**", ...coverageConfigDefaults.exclude]
    },
  }
})
