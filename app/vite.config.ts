import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import electron from 'vite-plugin-electron/simple';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: 'react',
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
		electron({
			main: { entry: 'electron/main.ts' },
			preload: { input: { preload: 'electron/preload.ts' } },
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
