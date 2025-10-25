import { User } from 'lucide-react';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle';
import { useAuth } from '@/providers/AuthProvider.tsx';

interface SidebarHeaderProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
}
export const SidebarHeader = ({ collapsed, onToggleCollapse }: SidebarHeaderProps)=> {
	const { user } = useAuth();
	return (
		<div className="flex items-center gap-2 px-2 py-2">
			{!collapsed && (<>
				<div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md shrink-0">
					<User className="size-4" />
				</div>

				<div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
					{user && <span className="truncate font-medium">{user.firstName} {user.lastName}</span>}
				</div>
			</>)}
			<div className="flex items-center justify-between">
				<SidebarToggle collapsed={collapsed} onToggle={onToggleCollapse} />
			</div>
		</div>
	);
};