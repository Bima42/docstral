import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';


export const Route = createRootRoute({
	component: () => (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	),
});
