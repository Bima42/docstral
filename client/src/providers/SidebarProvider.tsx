import { createContext, useContext, useMemo, useState } from 'react';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { useIsMobile } from '@/hooks/useMobile';
import { COLLAPSED_PX, EXPANDED_DESKTOP } from '@/config';

interface SidebarContextType {
    isCollapsed: boolean;
    collapse: () => void;
    expand: () => void;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(true);
	const isMobile = useIsMobile();

	const collapse = () => setIsCollapsed(true);
	const expand = () => setIsCollapsed(false);
	const toggleCollapse = () => setIsCollapsed((prev) => !prev);

	const contentStyle = useMemo<React.CSSProperties>(() => {
		if (isMobile) {
			return {
				marginLeft: '0px',
				width: '100vw',
				transition: 'margin-left 300ms ease-in-out, width 300ms ease-in-out',
			};
		}
		const width = isCollapsed ? `${COLLAPSED_PX}px` : EXPANDED_DESKTOP;
		return {
			marginLeft: width,
			width: `calc(100vw - ${width})`,
			transition: 'margin-left 300ms ease-in-out, width 300ms ease-in-out',
		};
	}, [isCollapsed, isMobile]);

	return (
		<SidebarContext.Provider value={{ isCollapsed, collapse, expand, toggleCollapse }}>
			<div style={contentStyle} className="min-h-screen flex flex-col bg-surface-warm">
				{children}
			</div>
			<AppSidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
	return context;
}