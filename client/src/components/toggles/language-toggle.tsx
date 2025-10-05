import { useLanguage } from '@/hooks/useLanguage';
import { Toggle } from '@/components/ui/toggle';

export function LanguageToggle() {
	const { toggleLanguage, getLanguageDisplay, currentLanguage } = useLanguage();

	return (
		<Toggle
			pressed={currentLanguage === 'en'}
			onPressedChange={toggleLanguage}
			className="h-10 w-10 p-0 border-0 bg-transparent hover:bg-sidebar-accent data-[state=on]:bg-transparent data-[state=off]:bg-transparent cursor-pointer"
			title="Toggle language"
		>
			<span className="text-sidebar-accent-foreground hover:text-primary font-medium text-sm transition-colors duration-200">
				{getLanguageDisplay()}
			</span>
		</Toggle>
	);
}