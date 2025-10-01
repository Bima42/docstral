import React from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useSidebar } from '@/providers/SidebarProvider.tsx';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle.tsx';
import { useIsMobile } from '@/hooks/useMobile.ts';

export const ChatHeader = () => {
	const isMobile = useIsMobile();
	const { isCollapsed, toggleCollapse } = useSidebar();
	const { metrics, messages } = useChatStore();

	const isSidebarOpen = !isCollapsed;

	const formatLatency = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);
	const formatCost = (cost: number) => `$${(cost ?? 0).toFixed(4)}`;

	return (
		<header className="sticky top-0 z-20 bg-surface-warm/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-4xl items-center px-4 py-3 sm:px-6">
				{!isSidebarOpen && isMobile && (
					<SidebarToggle
						collapsed={isCollapsed}
						onToggle={toggleCollapse}
					/>
				)}
				<div className="flex flex-1 max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2 sm:hidden">
							<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
							<span className="text-neutral-600 dark:text-neutral-400">{messages.length}</span>
						</div>
						<div className="hidden items-center gap-6 sm:flex">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-primary-500" />
								<span className="text-neutral-600 dark:text-neutral-400">{messages.length} messages</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-amber-500" />
								<span className="text-neutral-600 dark:text-neutral-400">{formatLatency(metrics.averageLatency)} avg</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-warm-700" />
								<span className="text-neutral-600 dark:text-neutral-400">{metrics.totalTokensOut} tokens</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-red-500" />
								<span className="text-neutral-600 dark:text-neutral-400">{formatCost(metrics.estimatedCost)}</span>
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