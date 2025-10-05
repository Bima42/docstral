import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChatInput } from '@/components/chat/ChatInput';
import { createChat } from '@/api/chat/chat';
import { queryClient } from '@/lib/queryClient';
import type { ChatDetail } from '@/api/client';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo.tsx';

const ChatsLanding = () => {
	const navigate = useNavigate();

	const handleSubmit = async (content: string) => {
		try {
			const newChat = await createChat({ title: content.slice(0, 50) });
			if (!newChat) return;

			queryClient.setQueryData<ChatDetail>(['chat', newChat.id], {
				...newChat,
				messages: [],
			});

			// ChatInterface will handle the stream
			await navigate({
				to: '/chats/$chatId',
				params: { chatId: newChat.id },
				state: { initialMessage: content },
			});
            
		} catch (err) {
			toast.error('Failed to create chat');
			throw err;
		}
	};

	return (
		<div className="flex h-screen flex-col items-center justify-center bg-surface-warm dark:bg-surface-warm px-4">
			<div className="w-full max-w-3xl space-y-6">
				<div className="flex flex-col items-center m-0">
					<Logo />
				</div>
				<ChatInput onSubmit={handleSubmit} />
			</div>
		</div>
	);
};

export const Route = createFileRoute('/chats/')({
	component: ChatsLanding,
});