import { useUIStore } from '@/stores/ui';
import { useEffect } from 'react';
import { MOBILE_BREAKPOINT } from '@/config.ts';

export const UIBootstrap = () => {
	const setIsMobile = useUIStore((s) => s.setIsMobile);

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const update = () => setIsMobile(mql.matches);
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}, [setIsMobile]);

	return null;
};