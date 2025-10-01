import { useEffect, useRef, useState } from 'react';

export function useAutoScroll<T extends HTMLElement>() {
	const ref = useRef<T | null>(null);
	const [isPinned, setPinned] = useState(true);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const onScroll = () => {
			const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
			setPinned(nearBottom);
		};
		el.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => el.removeEventListener('scroll', onScroll);
	}, []);

	const scrollToBottom = () => {
		const el = ref.current;
		if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
	};

	return { ref, isPinned, scrollToBottom };
}