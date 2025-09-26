import { User } from 'lucide-react';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle.tsx';

interface SidebarHeaderProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export function SidebarHeader({ collapsed, onToggleCollapse }: SidebarHeaderProps) {
	return (
		<div className="flex items-center gap-2 px-2 py-2">
			{!collapsed && (<>
				<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
					<User className="size-4" />
				</div>

				<div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
					<span className="truncate font-medium">Tanguy Pauvret</span>
					<span className="truncate text-xs text-sidebar-accent-foreground/70">Developer</span>
				</div>
			</>)}
			<div className="flex items-center justify-between">
				<SidebarToggle collapsed={collapsed} onToggle={onToggleCollapse} />
			</div>
		</div>
	);
}