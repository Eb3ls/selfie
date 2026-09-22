import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";

// Preserve the existing Hooks lint policy during the framework upgrade.
// React Compiler is not enabled; adopting its additional rules is separate work.
const existingHookRules = new Set([
	"react-hooks/rules-of-hooks",
	"react-hooks/exhaustive-deps"
]);
const compatibilityConfig = nextVitals.map((config) => ({
	...config,
	rules: Object.fromEntries(
		Object.entries(config.rules ?? {}).filter(
			([name]) =>
				!name.startsWith("react-hooks/") || existingHookRules.has(name)
		)
	)
}));

export default defineConfig([
	...compatibilityConfig,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])
]);
