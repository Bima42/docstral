import { useTheme } from '@/hooks/useTheme.ts';
import { useLanguage } from '@/hooks/useLanguage.ts';
import { LanguageToggle } from '@/components/toggles/language-toggle.tsx';
import { ThemeToggle } from '@/components/toggles/theme-toggle.tsx';

interface SidebarFooterProps {
    collapsed?: boolean;
}
export const SidebarFooter = ({ collapsed = false }: SidebarFooterProps)=> {
	const { isDark } = useTheme();
	const { getLanguageDisplay } = useLanguage();

	if (!collapsed) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between px-2">
					<span className="text-sm font-medium text-sidebar-foreground">Language</span>
					<LanguageToggle />
				</div>
				<div className="flex items-center justify-between px-2">
					<span className="text-sm font-medium text-sidebar-foreground">Theme</span>
					<ThemeToggle />
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 items-center">
			<div className="p-1" title={`Language: ${getLanguageDisplay()}`}>
				<LanguageToggle />
			</div>
			<div className="p-1" title={`Theme: ${isDark ? 'Dark' : 'Light'}`}>
				<ThemeToggle />
			</div>
		</div>
	);
};