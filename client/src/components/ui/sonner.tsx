import { Toaster as Sonner } from 'sonner';
import { useUIStore } from '@/stores/ui';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const theme = useUIStore((s) => s.theme);

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
                        'group toast group-[.toaster]:bg-surface-light group-[.toaster]:text-neutral-800 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-surface-warm dark:group-[.toaster]:text-neutral-50 dark:group-[.toaster]:border-neutral-700',
					description: 'group-[.toast]:text-neutral-600 dark:group-[.toast]:text-neutral-400',
					actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-white',
					cancelButton:
                        'group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-700 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-300',
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };