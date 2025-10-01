import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

type UIState = {
    theme: Theme;
    toggleTheme: () => void;

    isMobile: boolean;
    setIsMobile: (isMobile: boolean) => void;
};

const prefersDark = () =>
	typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export const useUIStore = create<UIState>()(
	persist(
		(set, get) => ({
			theme: prefersDark() ? 'dark' : 'light',
			toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

			isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
			setIsMobile: (isMobile) => set({ isMobile }),
		}),
		{
			name: 'ui',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ theme: state.theme }), // only persist theme
		}
	)
);