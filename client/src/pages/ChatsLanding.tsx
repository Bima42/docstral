import { useNavigate } from '@tanstack/react-router';
import { ChatInput } from '@/components/chat/ChatInput';
import { createChat } from '@/api/chat/chat';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo.tsx';
import { useStreamReply } from '@/api/chat/queries.ts';

export const ChatsLanding = () => {
	const navigate = useNavigate();
	const streamMutation = useStreamReply();

	const handleSubmit = async (content: string) => {
		try {
			const newChat = await createChat({ title: content.slice(0, 50) });
			if (!newChat) return;

			await streamMutation.mutateAsync({
				chatId: newChat.id,
				payload: { content }
			});

			await navigate({
				to: '/chats/$chatId',
				params: { chatId: newChat.id },
			});
		} catch {
			toast.error('Failed to create chat');
		}
	};

	return (
		<div className="flex h-screen flex-col items-center justify-center bg-surface-warm dark:bg-surface-warm px-4">
			<div className="w-full max-w-3xl space-y-6">
				<div className="flex flex-col items-center m-0">
					<Logo />
				</div>
				<ChatInput
					onSubmit={handleSubmit}
					disabled={streamMutation.isPending}
				/>
			</div>
		</div>
	);
};