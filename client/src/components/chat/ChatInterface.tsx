import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat, useStreamReply } from '@/api/chat/queries';
import { Route as ChatRoute } from '@/routes/chats/$chatId';
import { useLanguage } from '@/hooks/useLanguage.ts';

export const ChatInterface = () => {
	const { t } = useLanguage();
	const { chatId } = ChatRoute.useParams();
	const { data, isLoading, isError, error } = useChat(chatId);
	const streamMutation = useStreamReply();

	const handleSubmit = async (content: string) => {
		await streamMutation.mutateAsync({ chatId, payload: { content } });
	};

	return (
		<div className="flex h-screen flex-col bg-surface-warm dark:bg-surface-warm">
			<ChatHeader messageCount={data?.messages?.length ?? 0} />
			{isLoading ? (
				<div className="flex-1 flex items-center justify-center px-4">
					<div className="text-neutral-500 text-sm">Loading chat…</div>
				</div>
			) : isError ? (
				<div className="flex-1 flex items-center justify-center px-4">
					<div className="text-red-600 text-sm">
						{error instanceof Error ? error.message : 'Failed to load chat'}
					</div>
				</div>
			) : data?.messages ? (
				<MessageList messages={data.messages} />
			) : (
				<div className="flex-1 flex items-center justify-center px-4">
					<div className="text-neutral-500 text-sm">{t('chat.noMessages')}</div>
				</div>
			)}
			<ChatInput onSubmit={handleSubmit} />
		</div>
	);
};