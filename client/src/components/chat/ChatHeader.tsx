import { useSidebar } from '@/providers/SidebarProvider';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle';
import { useIsMobile } from '@/hooks/useMobile';

export const ChatHeader = ({ messageCount = 0 }: { messageCount?: number }) => {
	const isMobile = useIsMobile();
	const { isCollapsed, toggleCollapse } = useSidebar();

	const isSidebarOpen = !isCollapsed;

	return (
		<header className="sticky top-0 z-20 bg-surface-warm/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-4xl items-center px-4 py-3 sm:px-6">
				{!isSidebarOpen && isMobile && (
					<SidebarToggle collapsed={isCollapsed} onToggle={toggleCollapse} />
				)}
				<div className="flex flex-1 max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
					<div className="flex items-center gap-4 text-sm">
						<div className="hidden items-center gap-6 sm:flex">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary-500" />
								<span className="text-neutral-600 dark:text-neutral-400">
									{messageCount} messages
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
								<span className="font-medium text-green-600">Connected</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};