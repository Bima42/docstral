import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { deleteChatById, getChat, getChats, streamReply, updateChatTitle } from '@/api/chat/chat';
import { type ChatDetail, type MessageOut } from '@/api/client';

export function useChats(params?: { limit?: number; offset?: number }) {
	return useQuery({
		queryKey: ['chats', params ?? {}],
		queryFn: () => getChats(params),
		staleTime: 15_000,
	});
}

export function useChat(chatId: string) {
	return useQuery({
		queryKey: ['chat', chatId],
		queryFn: () => getChat(chatId),
		enabled: Boolean(chatId),
	});
}

export function useStreamReply() {
	return useMutation({
		mutationFn: async ({ chatId, payload }: { chatId: string; payload: { content: string } }) => {
			const userMsg: MessageOut = {
				id: `temp-user-${Date.now()}`,
				chatId,
				role: 'USER',
				content: payload.content,
				createdAt: new Date().toISOString(),
			};
			queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], (prev) =>
				prev ? { ...prev, messages: [...prev.messages || [], userMsg] } : prev,
			);

			const assistantId = `temp-assistant-${Date.now()}`;
			queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], (prev) =>
				prev
					? {
						...prev,
						messages: [
							...prev.messages || [],
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
										messages: prev.messages?.map((m) =>
											m.id === assistantId ? { ...m, content: aggregated } : m,
										),
									}
									: prev,
							);
							break;
						}
						case 'error':
							// TODO: mark error in UI
							break;
						case 'done':
						case 'start':
						default:
							break;
					}
				},
			});

			queryClient.invalidateQueries({ queryKey: ['chats'] });
			return { ok: true };
		},
	});
}

export function useUpdateChat() {
	return useMutation({
		mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
			return updateChatTitle(chatId, title);
		},
		onSuccess: (data, { chatId }) => {
			queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], (prev) =>
				prev ? { ...prev, title: data?.title ?? prev.title } : prev,
			);
			queryClient.invalidateQueries({ queryKey: ['chats'] });
		},
	});
}

export function useDeleteChat() {
	return useMutation({
		mutationFn: async (chatId: string) => {
			return deleteChatById(chatId);
		},
		onMutate: (chatId) => {
			queryClient.setQueryData<ChatDetail | undefined>(['chat', chatId], undefined);
			queryClient.setQueryData<ChatDetail[]>(['chats'], (prev) =>
				prev ? prev.filter((c) => c.id !== chatId) : prev,
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['chats'] });
		},
	});
}