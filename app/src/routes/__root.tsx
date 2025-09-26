import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/providers/SidebarProvider.tsx';


export const Route = createRootRoute({
	component: () => (
		<SidebarProvider>
			<main className="overflow-hidden">
				<Outlet />
			</main>
		</SidebarProvider>
	),
});