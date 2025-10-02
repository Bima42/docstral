import { useMutation, useQuery } from '@tanstack/react-query';
import type { ChatDetail, MessageOut } from '@/api/types';
import { queryClient } from '@/lib/queryClient';
import { getChat, listChats, streamReply } from '@/api/chat/chat.ts';

export function useChats(params?: { limit?: number; offset?: number }) {
	return useQuery({
		queryKey: ['chats', params ?? {}],
		queryFn: () => listChats(params),
		staleTime: 15_000,
	});
}

export function useChat(chatId: string | undefined) {
	return useQuery({
		queryKey: ['chat', chatId],
		queryFn: () => getChat(chatId!),
		enabled: Boolean(chatId),
	});
}

export function useStreamReply(chatId: string | undefined) {
	return useMutation({
		mutationKey: ['chat', chatId, 'stream'],
		mutationFn: async (payload: { content: string }) => {
			if (!chatId) throw new Error('chatId required');

			// Optimistic user message
			const userMsg: MessageOut = {
				id: `temp-user-${Date.now()}`,
				chatId,
				role: 'USER',
				content: payload.content,
				createdAt: new Date().toISOString(),
			};
			queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], (prev) =>
				prev ? { ...prev, messages: [...prev.messages, userMsg] } : prev,
			);

			// Placeholder assistant message
			const assistantId = `temp-assistant-${Date.now()}`;
			queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], (prev) =>
				prev
					? {
						...prev,
						messages: [
							...prev.messages,
							{
								id: assistantId,
								chatId,
								role: 'ASSISTANT',
								content: '',
								createdAt: new Date().toISOString(),
							},
						],
					}
					: prev,
			);

			let aggregated = '';

			await streamReply(chatId, payload, {
				onEvent: (e) => {
					switch (e.type) {
						case 'token': {
							aggregated += e.content ?? '';
							queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], (prev) =>
								prev
									? {
										...prev,
										messages: prev.messages.map((m) =>
											m.id === assistantId ? { ...m, content: aggregated } : m,
										),
									}
									: prev,
							);
							break;
						}
						case 'error': {
							// Optional: revert assistant msg or mark error
							break;
						}
						case 'done':
						case 'start':
						default:
							break;
					}
				},
			});

			// Refresh chat list after streaming completes (last message / timestamps)
			queryClient.invalidateQueries({ queryKey: ['chats'] });
			return { ok: true };
		},
	});
}