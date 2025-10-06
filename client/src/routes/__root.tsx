import { createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from '../components/ui/sonner';

export const Route = createRootRoute({
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