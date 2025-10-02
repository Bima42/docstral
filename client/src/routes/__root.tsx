import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/providers/SidebarProvider.tsx';


export const Route = createRootRoute({
	component: () => (
		<main className="overflow-hidden">
			<SidebarProvider>
				<Outlet />
			</SidebarProvider>
		</main>
	),
});