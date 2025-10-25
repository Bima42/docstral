import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { deleteChatById, getChats, streamReply, updateChatTitle } from '@/api/chat/chat';
import { type ChatDetail, type MessageOut } from '@/api/client';


export function useChats(params?: { limit?: number; offset?: number }) {
	return useQuery({
		queryKey: ['chats', params ?? {}],
		queryFn: () => getChats(params),
		staleTime: 15_000,
	});
}

export interface StreamReplyParams {
    chatId: string;
    content: string;
    retry?: boolean;
}

export function useStreamReply() {
	return useMutation({
		mutationFn: async ({ chatId, content, retry = false }: StreamReplyParams) => {
			// If not retry, add optimistic user message
			if (!retry) {
				const userMsg: MessageOut = {
					id: `temp-user-${Date.now()}`,
					chatId,
					role: 'user',
					content,
					createdAt: new Date().toISOString(),
				};

				queryClient.setQueryData<ChatDetail | undefined>(
					['chat', chatId],
					(prev) =>
						prev
							? { ...prev, messages: [...(prev.messages || []), userMsg] }
							: prev
				);
			}

			const assistantId = `temp-assistant-${Date.now()}`;
			queryClient.setQueryData<ChatDetail | undefined>(
				['chat', chatId],
				(prev) =>
					prev
						? {
							...prev,
							messages: [
								...(prev.messages || []),
								{
									id: assistantId,
									chatId,
									role: 'assistant',
									content: '',
									createdAt: new Date().toISOString(),
								},
							],
						}
						: prev
			);

			let aggregated = '';

			try {
				await streamReply({
					chatId,
					content,
					retry,
					onChunk: (chunk) => {
						aggregated += chunk;
						queryClient.setQueryData<ChatDetail | undefined>(
							['chat', chatId],
							(prev) => {
								if (!prev) return prev;
								const messages = prev.messages || [];
								const lastIdx = messages.length - 1;
								if (lastIdx >= 0 && messages[lastIdx].id === assistantId) {
									const updated = [...messages];
									updated[lastIdx] = { ...updated[lastIdx], content: aggregated };
									return { ...prev, messages: updated };
								}
								return prev;
							}
						);
					},
				});
			} catch (error) {
				// Remove failed assistant message on error
				queryClient.setQueryData<ChatDetail | undefined>(
					['chat', chatId],
					(prev) => {
						if (!prev) return prev;
						const messages = prev.messages || [];
						return {
							...prev,
							messages: messages.filter((m) => m.id !== assistantId),
						};
					}
				);
				throw error;
			}

			// Refetch to get server state
			await queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
			await queryClient.invalidateQueries({ queryKey: ['chats'] });

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