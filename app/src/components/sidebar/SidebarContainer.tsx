/**
 * SidebarContainer - Use to the entire sidebar including backdrop
 *
 * @param children - The sidebar content
 * @param isOpen - Whether the sidebar is open or not
 * @param isVisible - Whether the sidebar is visible or not (for animation purposes)
 * @param onClose
 * @param blur - apply blur on background
 */
export function SidebarContainer({
	children,
	isOpen,
	isVisible,
	onClose,
	blur = false
}: {
    children: React.ReactNode;
    isOpen: boolean;
    isVisible: boolean;
    onClose?: () => void;
    blur?: boolean;
}) {
	if (!isVisible) return null;

	return (
		<div
			className={`
        fixed inset-0 z-50
        animate-in fade-in duration-300
        ${!isOpen ? 'animate-out fade-out duration-300' : ''}
      `}
		>
			<div
				onClick={onClose}
				aria-hidden="true"
				className={[
					'absolute inset-0',
					'bg-black/20',
					blur ? 'backdrop-blur-sm' : '',
					'touch-none'
				].join(' ')}
			/>
			{children}
		</div>
	);
}