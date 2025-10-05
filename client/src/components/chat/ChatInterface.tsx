import { useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat, useStreamReply } from '@/api/chat/queries';
import { Route as ChatRoute } from '@/routes/chats/$chatId';
import { useLocation, useNavigate } from '@tanstack/react-router';

export const ChatInterface = () => {
	const { chatId } = ChatRoute.useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { data, isLoading, isError, error } = useChat(chatId);
	const streamMutation = useStreamReply();

	const isProcessingInitial = useRef(false);

	useEffect(() => {
		const initialMessage = location.state?.initialMessage;

		if (!initialMessage || isProcessingInitial.current || streamMutation.isPending) {
			return;
		}

		isProcessingInitial.current = true;

		navigate({
			to: '/chats/$chatId',
			params: { chatId },
			state: {},
			replace: true,
		});

		streamMutation.mutate(
			{ chatId, payload: { content: initialMessage } },
			{
				onSettled: () => {
					isProcessingInitial.current = false;
				}
			}
		);
	}, [chatId, location.state, streamMutation, navigate]);

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
					<div className="text-neutral-500 text-sm">No messages yet.</div>
				</div>
			)}
			<ChatInput onSubmit={handleSubmit} disabled={streamMutation.isPending} />
		</div>
	);
};