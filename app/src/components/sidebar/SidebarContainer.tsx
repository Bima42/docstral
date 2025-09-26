/**
 * SidebarContainer - Use to the entire sidebar including backdrop
 *
 * @param children - The sidebar content
 * @param isOpen - Whether the sidebar is open or not
 * @param isVisible - Whether the sidebar is visible or not (for animation purposes)
 */
export function SidebarContainer({
	children,
	isOpen,
	isVisible
}: {
    children: React.ReactNode;
    isOpen: boolean;
    isVisible: boolean;
}) {
	if (!isVisible) return null;

	return (
		<div
			className={`
                fixed inset-0 z-50
                animate-in fade-in duration-300
                ${!isOpen && 'animate-out fade-out duration-300'}
            `}
		>
			{children}
		</div>
	);
}