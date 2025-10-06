import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from '../components/ui/sonner';
import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
    queryClient: QueryClient;
}
export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<main className="overflow-hidden">
			<AuthProvider>
				<SidebarProvider>
					<Outlet />
				</SidebarProvider>
			</AuthProvider>
			<Toaster />
		</main>
	),
});