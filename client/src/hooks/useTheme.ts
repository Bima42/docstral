import { useUIStore } from '@/stores/ui.ts';

export function useTheme() {
	const theme = useUIStore((s) => s.theme);
	const toggleTheme = useUIStore((s) => s.toggleTheme);

	return {
		theme,
		toggleTheme,
		isDark: theme === 'dark',
	};
}