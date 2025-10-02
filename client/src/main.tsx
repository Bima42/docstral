import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './index.css';
import './i18n';
import { AuthProvider } from '@/providers/AuthProvider.tsx';
import { UIBootstrap } from '@/utils/UIBootstrap.tsx';
import { QueryProvider } from '@/providers/QueryProvider.tsx';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryProvider>
				<AuthProvider>
					<UIBootstrap />
					<RouterProvider router={router} />
				</AuthProvider>
			</QueryProvider>
		</StrictMode>,
	);
}