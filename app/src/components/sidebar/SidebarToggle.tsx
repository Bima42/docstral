import { PanelLeft } from 'lucide-react';

export function SidebarToggle({
	collapsed,
	onToggle,
	fixed = false,
	className = ''
}: {
    collapsed: boolean;
    onToggle: () => void;
    fixed?: boolean;
    className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-label={collapsed ? 'Ouvrir la sidebar' : 'Réduire la sidebar'}
			className={[
				fixed ? 'fixed top-3 left-3 z-40' : '',
				'm-2 inline-flex items-center justify-center rounded-md p-2',
				'text-sidebar-accent-foreground',
				'hover:bg-sidebar-accent/80',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
				'transition-colors',
				className
			].join(' ')}
		>
			<PanelLeft className="size-4" />
		</button>
	);
}