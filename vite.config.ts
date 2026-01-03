import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectDir = dirname(fileURLToPath(import.meta.url));
const convexDir = resolve(projectDir, 'convex');

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			$convex: convexDir
		}
	},
	server: {
		fs: {
			allow: [convexDir]
		}
	}
});
