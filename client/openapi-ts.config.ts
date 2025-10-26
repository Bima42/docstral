import { defineConfig } from '@hey-api/openapi-ts';
import { BASE_API_URL } from './src/config';

export default defineConfig({
	input: `${BASE_API_URL}/openapi.json`,
	output: {
		path: 'src/api/client',
		lint: 'eslint'
	},
	plugins: [
		{
			name: '@hey-api/client-fetch',
		},
	],
});