import { defineConfig } from 'vitest/config';

// The handler is deliberately plain TypeScript (no `cloudflare:workers` import),
// so it runs under the Node environment. The old `@cloudflare/vitest-pool-workers`
// setup was pinned to vitest 2.x and could not run against vitest 4.
export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/**/*.spec.ts'],
	},
	css: {
		postcss: false,
	},
});
