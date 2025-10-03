import { fetchSse } from '@/api/http.ts';
import {
	type ChatCreate,
	createChatChatsPost,
	getChatChatChatIdGet,
	listChatsChatsGet,
	type MessageCreate
} from '@/api/client';
import { TOKEN_STORAGE_KEY } from '@/config.ts';

function getAuthHeaders() {
	const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listChats(params?: { limit?: number; offset?: number }) {
	const { data } = await listChatsChatsGet({
		query: params,
		headers: getAuthHeaders(),
	});
	return data ?? [];
}

export async function getChat(chatId: string) {
	const { data } = await getChatChatChatIdGet({
		path: { chat_id: chatId },
		headers: getAuthHeaders(),
	});
	return data;
}

export async function createChat(payload: ChatCreate) {
	const { data } = await createChatChatsPost({
		body: payload,
		headers: getAuthHeaders(),
	});
	return data;
}

export type StreamEvent =
    | { type: 'start' }
    | { type: 'token'; content: string }
    | { type: 'done' }
    | { type: 'error'; error: string };

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