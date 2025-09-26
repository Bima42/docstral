import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useMobile.ts';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader.tsx';
import { SidebarContainer } from '@/components/sidebar/SidebarContainer.tsx';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter.tsx';
import { SidebarBackdrop } from '@/components/sidebar/SidebarBackdrop.tsx';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle.tsx';
import { SidebarContent } from '@/components/sidebar/SidebarContent.tsx';

/**
 * Desktop sidebar - Always visible, even if collapsed
 */
function SidebarDesktop({
	isCollapsed,
	onToggleCollapse
}: {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}) {
	return (
		<div
			className={[
				'fixed left-0 top-0 bottom-0',
				'bg-sidebar text-sidebar-foreground',
				'border-r border-sidebar-border shadow-lg',
				'flex flex-col overflow-hidden',
				'transition-all duration-300 ease-in-out',
				isCollapsed
					? 'w-[64px] min-w-[64px] max-w-[64px]'
					: 'w-[18%] min-w-[300px] max-w-[18%]',
				'group'
			].join(' ')}
			data-collapsible={isCollapsed ? 'icon' : 'full'}
		>
			<div className="border-b border-sidebar-border">
				<SidebarHeader collapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
			</div>

			{/* Enforce toggles stays at the bottom of the collapsed sidebar */}
			<div className="flex flex-col flex-1 min-h-0">
				<SidebarContent collapsed={isCollapsed} />
				<div className="mt-auto border-t border-sidebar-border">
					<SidebarFooter />
				</div>
			</div>
		</div>
	);
}

function SidebarMobilePanel({
	children,
	isOpen
}: {
    children: React.ReactNode;
    isOpen: boolean;
}) {
	return (
		<div
			className={`
                fixed left-0 top-0 bottom-0 
                w-[85%] min-w-[280px] max-w-[360px]
                bg-sidebar text-sidebar-foreground
                border-r border-sidebar-border shadow-lg
                animate-in slide-in-from-left duration-300
                ${!isOpen && 'animate-out slide-out-to-left duration-300'}
                flex flex-col
                overflow-hidden
              `}
			data-collapsible="full"
		>
			{children}
		</div>
	);
}

export interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function AppSidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
	const isMobile = useIsMobile();
	const isOpen = !isCollapsed;

	// Use for animation
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (!isMobile) return;
		if (isOpen) {
			setIsVisible(true);
		} else {
			const timeout = setTimeout(() => {
				setIsVisible(false);
			}, 300);
			return () => clearTimeout(timeout);
		}
	}, [isOpen, isMobile]);

	useEffect(() => {
		if (!isMobile) {
			setIsVisible(false);
		}
	}, [isMobile]);

	if (!isMobile) {
		return (
			<SidebarDesktop
				isCollapsed={isCollapsed}
				onToggleCollapse={onToggleCollapse}
			/>
		);
	}

	return (
		<>
			{!isOpen && (
				<SidebarToggle collapsed={isCollapsed} onToggle={onToggleCollapse} />
			)}

			<SidebarContainer isOpen={isOpen} isVisible={isVisible}>
				<SidebarBackdrop isOpen={isOpen} onClick={onToggleCollapse} />
				<SidebarMobilePanel isOpen={isOpen}>
					<div className="border-b border-sidebar-border">
						<SidebarHeader collapsed={false} onToggleCollapse={onToggleCollapse} />
					</div>

					{/* Enforce toggles stays at the bottom of the collapsed sidebar */}
					<div className="flex flex-col flex-1 min-h-0">
						<SidebarContent collapsed={false} />
						<div className="mt-auto border-t border-sidebar-border">
							<SidebarFooter />
						</div>
					</div>
				</SidebarMobilePanel>
			</SidebarContainer>
		</>
	);
}