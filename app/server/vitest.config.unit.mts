import { coverageConfigDefaults, defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            exclude: ["**/build/**", "**/services/prisma.ts", ...coverageConfigDefaults.exclude]
        },
    },
})