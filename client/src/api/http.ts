import { BASE_API_URL } from '@/config.ts';

type TokenProvider = () => string | null;
let tokenProvider: TokenProvider = () => null;

export function setTokenProvider(fn: TokenProvider) {
	tokenProvider = fn;
}

export class ApiError extends Error {
	status: number;
	body: unknown;
	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.status = status;
		this.body = body;
	}
}

export type SseMessage = {
    event?: string;
    data: string;
};

export async function fetchSse(
	path: string,
	init: RequestInit & {
        signal?: AbortSignal;
        onMessage: (msg: SseMessage) => void;
    },
) {
	const url = `${BASE_API_URL}${path}`;
	const token = tokenProvider();
	const res = await fetch(url, {
		...init,
		headers: {
			Accept: 'text/event-stream',
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(init.headers ?? {}),
		},
	});
	if (!res.ok || !res.body) {
		const text = await res.text().catch(() => '');
		throw new ApiError(`Stream HTTP ${res.status}`, res.status, text);
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			// Process SSE frames delimited by \n\n
			let sepIndex: number;
			while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
				const rawFrame = buffer.slice(0, sepIndex);
				buffer = buffer.slice(sepIndex + 2);

				if (rawFrame.startsWith(':')) {
					// Comment/heartbeat like ": ping"
					continue;
				}

				let event: string | undefined;
				const dataLines: string[] = [];
				for (const line of rawFrame.split('\n')) {
					if (line.startsWith('event:')) {
						event = line.slice(6).trim();
					} else if (line.startsWith('data:')) {
						dataLines.push(line.slice(5).trim());
					}
				}
				const data = dataLines.join('\n');
				if (data.length) {
					init.onMessage({ event, data });
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}