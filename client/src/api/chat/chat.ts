import {
	type ChatCreate,
	createChatChatsPost, deleteChat, getChatById,
	listChats,
	updateChat
} from '@/api/client';
import { getAuthHeaders } from '@/api/auth/auth';
import { BASE_API_URL } from '@/config';

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


export interface StreamReplyOptions {
    chatId: string;
    content: string;
    onChunk: (chunk: string) => void;
    signal?: AbortSignal;
}

/**
 * Consume SSE stream from /chat/{chat_id}/stream.
 * Bypasses HeyAPI wrapper to access raw ReadableStream.
 */
export async function streamReply({
	chatId,
	content,
	onChunk,
	signal,
}: StreamReplyOptions): Promise<void> {
	const authHeaders = getAuthHeaders();
	const response = await fetch(
		`${BASE_API_URL}/chat/${chatId}/stream`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': authHeaders.Authorization || '',
			},
			body: JSON.stringify({ content }),
			signal,
		}
	);

	if (!response.ok) {
		throw new Error(`Stream failed: ${response.status}`);
	}

	const reader = response.body?.getReader();
	if (!reader) throw new Error('No response body');

	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				if (line.trim()) {
					onChunk(line);
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}