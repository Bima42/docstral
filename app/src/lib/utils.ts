import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(date));
}

export function formatDateRange(
	startDate: Date | string,
	endDate?: Date | string | null,
): string {
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : null;

	const formatOptions: Intl.DateTimeFormatOptions = {
		month: 'short',
		year: 'numeric',
	};

	const startFormatted = new Intl.DateTimeFormat('en-US', formatOptions).format(
		start,
	);

	if (!end) {
		return `${startFormatted} - Present`;
	}

	const endFormatted = new Intl.DateTimeFormat('en-US', formatOptions).format(
		end,
	);

	return `${startFormatted} - ${endFormatted}`;
}

export function slugify(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^\w ]+/g, '')
		.replace(/ +/g, '-');
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trim() + '...';
}

export function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function throttle<T extends (...args: unknown[]) => void>(
	func: T,
	limit: number,
): (...args: Parameters<T>) => void {
	let inThrottle: boolean = false;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function calculateReadingTime(text: string): number {
	const wordsPerMinute = 200;
	const words = text.trim().split(/\s+/).length;
	return Math.ceil(words / wordsPerMinute);
}

export function copyToClipboard(text: string): Promise<boolean> {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard
			.writeText(text)
			.then(() => true)
			.catch(() => false);
	} else {
		// Fallback for older browsers
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'absolute';
		textArea.style.left = '-999999px';
		document.body.prepend(textArea);
		textArea.select();

		try {
			document.execCommand('copy');
			return Promise.resolve(true);
		} catch {
			return Promise.resolve(false);
		} finally {
			textArea.remove();
		}
	}
}

export function getRandomItems<T>(array: T[], count: number): T[] {
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

export function groupBy<T, K extends string | number | symbol>(
	array: T[],
	key: (item: T) => K,
): Record<K, T[]> {
	return array.reduce(
		(groups, item) => {
			const groupKey = key(item);
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(item);
			return groups;
		},
    {} as Record<K, T[]>,
	);
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeHtmlTags(html: string): string {
	return html.replace(/<[^>]*>/g, '');
}

export function capitalizeFirstLetter(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
