export function SidebarBackdrop({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
	return (
		<div
			className={`
                fixed inset-0 bg-neutral-700/70 backdrop-blur-[2px]
                animate-in fade-in duration-300
                ${!isOpen && 'animate-out fade-out duration-300'}
        `}
			onClick={onClick}
		/>
	);
}