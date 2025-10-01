/**
 * SidebarSection - Represent a section in the sidebar
 *
 * @param label - Optional label that will be displayed at the top of the section
 * @param children
 * @param className
 */
interface SidebarSectionProps {
    children: React.ReactNode;
    label?: string;
    className?: string;
}
export const SidebarSection = ({
	label,
	children,
	className = ''
}: SidebarSectionProps) => {
	return (
		<div className={`flex flex-col h-full ${className}`}>
			{label && (
				<div className="sticky top-0 z-10 bg-sidebar px-3 pt-2 pb-1 text-[0.7rem] font-medium uppercase tracking-wide text-sidebar-accent-foreground/70">
					{label}
				</div>
			)}
			<div className="flex-1 overflow-y-auto">{children}</div>
		</div>
	);
};