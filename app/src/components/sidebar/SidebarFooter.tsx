import { useTheme } from '@/hooks/useTheme.ts';
import { useLanguage } from '@/hooks/useLanguage.ts';
import { LanguageToggle } from '@/components/toggles/language-toggle.tsx';
import { ThemeToggle } from '@/components/toggles/theme-toggle.tsx';

export function SidebarFooter() {
	const { isDark } = useTheme();
	const { getLanguageDisplay } = useLanguage();

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
				<span className="text-sm font-medium text-sidebar-foreground">
                    Language
				</span>
				<div className="flex items-center gap-2">
					<LanguageToggle />
				</div>
			</div>

			<div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
				<span className="text-sm font-medium text-sidebar-foreground">
                    Theme
				</span>
				<div className="flex items-center gap-2">
					<ThemeToggle />
				</div>
			</div>

			<div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center">
				<div className="p-1" title={`Language: ${getLanguageDisplay()}`}>
					<LanguageToggle />
				</div>
				<div className="p-1" title={`Theme: ${isDark ? 'Dark' : 'Light'}`}>
					<ThemeToggle />
				</div>
			</div>
		</div>
	);
}