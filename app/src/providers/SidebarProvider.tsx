import { createContext, useContext, useState } from 'react';
import { AppSidebar } from '@/components/sidebar/AppSidebar.tsx';

interface SidebarContextType {
    isCollapsed: boolean;
    collapse: () => void;
    expand: () => void;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(true);

	const collapse = () => setIsCollapsed(true);
	const expand = () => setIsCollapsed(false);
	const toggleCollapse = () => setIsCollapsed((prev) => !prev);

	return (
		<SidebarContext.Provider
			value={{
				isCollapsed,
				collapse,
				expand,
				toggleCollapse
			}}
		>
			{children}
			<AppSidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider');
	}
	return context;
}
