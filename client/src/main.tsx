import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './index.css';
import './i18n';
import { UIBootstrap } from '@/utils/UIBootstrap';
import { QueryProvider } from '@/providers/QueryProvider';
import { queryClient } from '@/lib/queryClient';
import { client } from '@/api/client/client.gen';
import { BASE_API_URL } from '@/config.ts';


export const router = createRouter({
	routeTree,
	context: {
		queryClient,
	}
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

client.setConfig({
	baseUrl: BASE_API_URL,
});

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryProvider>
				<UIBootstrap />
				<RouterProvider router={router} />
			</QueryProvider>
		</StrictMode>,
	);
}