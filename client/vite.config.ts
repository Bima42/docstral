import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import electron from 'vite-plugin-electron/simple';

const isLocal = process.env.VITE_VERSION === 'local';

// Function to return the electron plugin only in development mode
const getElectronPlugin = () => {
	if (!isLocal) {
		return electron({
			main: {
				entry: 'electron/main.ts',
			},
			preload: { input: { preload: 'electron/preload.ts' } },
		});
	}
	return null;
};

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: 'react',
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
		getElectronPlugin()
	],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		hmr: { host: 'localhost' },
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
