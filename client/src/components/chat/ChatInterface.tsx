import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useStreamReply } from '@/api/chat/queries';
import { useLanguage } from '@/hooks/useLanguage.ts';
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/chats/$chatId');

export const ChatInterface = () => {
	const { t } = useLanguage();
	const { chat } = routeApi.useLoaderData();

	const streamMutation = useStreamReply();

	const handleSubmit = async (content: string) => {
		await streamMutation.mutateAsync({ chatId: chat.id, payload: { content } });
	};

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
			<ChatInput onSubmit={handleSubmit} />
		</div>
	);
};