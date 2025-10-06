import { useUIStore } from '@/stores/ui';

export function useTheme() {
	const theme = useUIStore((s) => s.theme);
	const toggleTheme = useUIStore((s) => s.toggleTheme);

	return {
		theme,
		toggleTheme,
		isDark: theme === 'dark',
	};
}