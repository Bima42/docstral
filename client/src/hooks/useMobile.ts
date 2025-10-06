import { useUIStore } from '@/stores/ui';

export function useIsMobile() {
	return useUIStore((s) => s.isMobile);
}