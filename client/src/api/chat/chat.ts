import { apiJson, fetchSse } from '@/api/http.ts';
import type { ChatCreate, ChatDetail, ChatOut, MessageCreate, StreamEvent } from '@/api/types.ts';

export async function listChats(params?: { limit?: number; offset?: number }) {
	const search = new URLSearchParams();
	if (params?.limit != null) search.set('limit', String(params.limit));
	if (params?.offset != null) search.set('offset', String(params.offset));
	const qs = search.toString();
	return apiJson<ChatOut[]>(`/chats${qs ? `?${qs}` : ''}`);
}

export async function getChat(chatId: string) {
	return apiJson<ChatDetail>(`/chat/${chatId}`);
}

export async function createChat(payload: ChatCreate) {
	return apiJson<ChatDetail>('/chats', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function streamReply(
	chatId: string,
	payload: MessageCreate,
	opts: {
        signal?: AbortSignal;
        onEvent: (e: StreamEvent) => void;
    },
) {
	return fetchSse(`/chat/${chatId}/stream`, {
		method: 'POST',
		body: JSON.stringify(payload),
		signal: opts.signal,
		onMessage: ({ event, data }) => {
			if (event !== 'message') return;
			try {
				const parsed = JSON.parse(data) as StreamEvent;
				if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return;
				opts.onEvent(parsed);
			} catch {
				// ignore malformed data chunks
			}
		},
	});
}