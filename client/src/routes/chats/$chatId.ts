import { createFileRoute, redirect } from '@tanstack/react-router';
import { ChatPage } from '@/pages/ChatPage.tsx';
import { getChat } from '@/api/chat/chat';

export const Route = createFileRoute('/chats/$chatId')({
	loader: async ({ params, context }) => {
		try {
			const chat = await context.queryClient.ensureQueryData({
				queryKey: ['chat', params.chatId],
				queryFn: () => getChat(params.chatId),
			});
            
			if (!chat) {
				throw redirect({ to: '/chats' });
			}

			return { chat };
		} catch {
			throw redirect({ to: '/chats' });
		}
	},
	component: ChatPage,
});