import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const convexPackageDir = path.dirname(require.resolve('convex/package.json'));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		// Shared Convex sources are symlinked from outside the app root in this
		// monorepo. Anchor bare `convex/*` imports to the app's installed package
		// so SSR builds on Vercel don't try to resolve them from `/shared/...`.
		alias: {
			convex: convexPackageDir
		}
	},
	server: {
		fs: {
			// Allow serving files from one level up from the project root (includes node_modules)
			allow: ['..']
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
