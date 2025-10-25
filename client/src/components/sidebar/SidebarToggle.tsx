import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarToggleProps {
    collapsed: boolean;
    onToggle: () => void;
    fixed?: boolean;
    className?: string;
}
export const SidebarToggle = ({
	collapsed,
	onToggle,
	fixed = false,
	className = ''
}: SidebarToggleProps) => {
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={onToggle}
			aria-label={collapsed ? 'Ouvrir la sidebar' : 'Réduire la sidebar'}
			className={[
				fixed ? 'fixed top-3 left-3 z-40' : '',
				'm-2',
				'text-sidebar-accent-foreground',
				'hover:bg-sidebar-accent/80',
				className
			].join(' ')}
		>
			<PanelLeft className="size-4" />
		</Button>
	);
};