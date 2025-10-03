import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/api/chat/queries';
import { Route as ChatRoute } from '@/routes/chats/$chatId';

export const ChatInterface = () => {
	const { chatId } = ChatRoute.useParams();
	const { data, isLoading, isError, error } = useChat(chatId);

	return (
		<div className="flex h-screen flex-col bg-surface-warm dark:bg-surface-warm">
			<ChatHeader messageCount={data?.messages.length ?? 0} />
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
			) : data && data.messages ? (
				<MessageList messages={data.messages} />
			) : (
				<div className="flex-1 flex items-center justify-center px-4">
					<div className="text-neutral-500 text-sm">No messages yet.</div>
				</div>
			)}
			<ChatInput chatId={chatId} />
		</div>
	);
};