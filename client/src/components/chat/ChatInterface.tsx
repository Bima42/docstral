import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useStreamReply } from '@/api/chat/queries';
import { useLanguage } from '@/hooks/useLanguage';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getChat } from '@/api/chat/chat';

export const ChatInterface = () => {
	const { t } = useLanguage();
	const { chatId } = useParams({ from: '/chats/$chatId' });

	const { data: chat, isLoading } = useQuery({
		queryKey: ['chat', chatId],
		queryFn: () => getChat(chatId),
		staleTime: 0,
	});

	const streamMutation = useStreamReply();

	const handleSubmit = async (content: string) => {
		if (!chat) return;
		await streamMutation.mutateAsync({ chatId: chat.id, content });
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-surface-warm">
				<div className="text-sm text-neutral-500">{t('common.loading')}</div>
			</div>
		);
	}

	if (!chat) {
		return (
			<div className="flex h-screen items-center justify-center bg-surface-warm">
				<div className="text-sm text-neutral-500">{t('chat.notFound')}</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col bg-surface-warm dark:bg-surface-warm">
			<ChatHeader messageCount={chat.messages?.length ?? 0} />
			{chat.messages ? (
				<MessageList messages={chat.messages} />
			) : (
				<div className="flex-1 flex items-center justify-center px-4">
					<div className="text-neutral-500 text-sm">{t('chat.noMessages')}</div>
				</div>
			)}
			<ChatInput onSubmit={handleSubmit} disabled={streamMutation.isPending} />
		</div>
	);
};