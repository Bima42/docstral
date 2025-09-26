import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/providers/SidebarProvider.tsx';


export const Route = createRootRoute({
	component: () => (
		<SidebarProvider>
			<main className="flex-1 overflow-auto">
				<Outlet />
			</main>
		 </SidebarProvider>
	),
});
