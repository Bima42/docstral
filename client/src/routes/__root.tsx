import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/providers/SidebarProvider.tsx';
import { AuthProvider } from '@/providers/AuthProvider.tsx';


export const Route = createRootRoute({
	component: () => (
		<main className="overflow-hidden">
			<AuthProvider>
				<SidebarProvider>
					<Outlet />
				</SidebarProvider>
			</AuthProvider>
		</main>
	),
});