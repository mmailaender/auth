import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { createRequire } from 'node:module';
import path from 'node:path';

const projectRequire = createRequire(path.resolve(process.cwd(), 'package.json'));
const sharedConvexSegment = `${path.sep}shared${path.sep}convex${path.sep}`;

function isBareImport(source: string): boolean {
	return !source.startsWith('.') && !source.startsWith('/') && !source.startsWith('\0');
}

export default defineConfig({
	plugins: [
		{
			name: 'resolve-shared-convex-deps',
			enforce: 'pre',
			resolveId(source, importer) {
				if (!importer || !isBareImport(source) || !importer.includes(sharedConvexSegment)) {
					return null;
				}

				try {
					return projectRequire.resolve(source);
				} catch {
					return null;
				}
			}
		},
		tailwindcss(),
		sveltekit()
	],
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
