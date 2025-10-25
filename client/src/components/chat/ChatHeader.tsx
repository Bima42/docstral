import { useSidebar } from '@/providers/SidebarProvider';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle';
import { useIsMobile } from '@/hooks/useMobile';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { healthGet } from '@/api/client';

export const ChatHeader = ({ messageCount = 0 }: { messageCount?: number }) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const isMobile = useIsMobile();
	const { isCollapsed, toggleCollapse } = useSidebar();

	const isSidebarOpen = !isCollapsed;
	const isOnChatsPage = location.pathname === '/chats';

	const handleNewChat = () => {
		navigate({ to: '/chats' });
	};

	// Fetch mode from /health
	const { data: healthData } = useQuery({
		queryKey: ['health'],
		queryFn: async () => {
			const response = await healthGet();
			return response.data;
		},
		staleTime: Infinity, // mode won't change during session
		retry: 1,
	});

	const mode = healthData?.mode;

	return (
		<header className="sticky top-0 z-20 bg-surface-warm backdrop-blur-md">
			<div className="mx-auto flex max-w-4xl items-center py-3 sm:px-6">
				{!isSidebarOpen && isMobile && (
					<SidebarToggle collapsed={isCollapsed} onToggle={toggleCollapse} />
				)}
				<div className="flex flex-1 max-w-4xl items-center justify-between py-3">
					<div className="flex items-center gap-4 text-sm">
						{!isOnChatsPage && (
							<Button
								variant="outline"
								onClick={handleNewChat}
								size={'sm'}
								className="rounded-md text-neutral-800 border-neutral-300 hover:bg-neutral-100 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
							>
                                + {t('common.new')}
							</Button>
						)}
						<div className="hidden items-center gap-4 sm:flex">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary" />
								<span className="text-neutral-600 dark:text-neutral-400">
									{messageCount} messages
								</span>
							</div>
							{mode && (
								<Badge className="font-normal rounded-sm">
                                    Mode {mode}
								</Badge>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};