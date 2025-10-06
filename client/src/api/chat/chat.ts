import { fetchSse } from '@/api/http';
import {
	type ChatCreate,
	createChatChatsPost, deleteChat, getChatById,
	listChats,
	type MessageCreate, updateChat
} from '@/api/client';
import { getAuthHeaders } from '@/api/auth/auth';

export async function getChats(params?: { limit?: number; offset?: number }) {
	const { data } = await listChats({
		query: params,
		headers: getAuthHeaders(),
	});
	return data ?? [];
}

export async function getChat(chatId: string) {
	const { data } = await getChatById({
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

export async function updateChatTitle(chatId: string, title: string) {
	const { data } = await updateChat({
		path: { chat_id: chatId },
		body: { title },
		headers: getAuthHeaders(),
	});
	return data;
}

export async function deleteChatById(chatId: string) {
	const { response } = await deleteChat({
		path: { chat_id: chatId },
		headers: getAuthHeaders(),
	});
	return response.status === 204;
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