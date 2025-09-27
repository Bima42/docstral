import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useMobile.ts';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader.tsx';
import { SidebarContainer } from '@/components/sidebar/SidebarContainer.tsx';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter.tsx';
import { SidebarContent } from '@/components/sidebar/SidebarContent.tsx';

interface SidebarDesktopProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}
export const SidebarDesktop = ({
	isCollapsed,
	onToggleCollapse
}: SidebarDesktopProps)=> {
	return (
		<div
			className={[
				'fixed left-0 top-0 bottom-0',
				'bg-sidebar text-sidebar-foreground',
				'flex flex-col overflow-hidden',
				'transition-all duration-300 ease-in-out',
				isCollapsed
					? 'w-[64px] min-w-[64px] max-w-[64px]'
					: 'w-[18%] min-w-[300px] max-w-[18%]',
				'group'
			].join(' ')}
			data-collapsible={isCollapsed ? 'icon' : 'full'}
		>
			<SidebarHeader collapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />

			<div className="flex flex-col flex-1 min-h-0">
				<SidebarContent collapsed={isCollapsed} />
				<div className="mt-auto">
					<SidebarFooter collapsed={isCollapsed} />
				</div>
			</div>
		</div>
	);
};

interface SidebarMobilePanelProps {
    children: React.ReactNode;
    isOpen: boolean;
}
const  SidebarMobilePanel = ({
	children,
	isOpen
}: SidebarMobilePanelProps) => {
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
};

export interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}
export const AppSidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps)=> {
	const isMobile = useIsMobile();
	const isOpen = !isCollapsed;

	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (!isMobile) return;
		if (isOpen) {
			setIsVisible(true);
		} else {
			const timeout = setTimeout(() => setIsVisible(false), 300);
			return () => clearTimeout(timeout);
		}
	}, [isOpen, isMobile]);

	useEffect(() => {
		if (!isMobile) setIsVisible(false);
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
			<SidebarContainer
				isOpen={isOpen}
				isVisible={isVisible}
				onClose={onToggleCollapse}
				blur
			>
				<SidebarMobilePanel isOpen={isOpen}>
					<SidebarHeader collapsed={false} onToggleCollapse={onToggleCollapse} />
					<div className="flex flex-col flex-1 min-h-0">
						<SidebarContent collapsed={false} />
						<div className="mt-auto">
							<SidebarFooter collapsed={false} />
						</div>
					</div>
				</SidebarMobilePanel>
			</SidebarContainer>
		</>
	);
};