import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { MessageOut } from '@/api/client';
import { useStreamReply } from '@/api/chat/queries';
import { useParams } from '@tanstack/react-router';

interface MessageListProps {
    messages: MessageOut[];
}

export const MessageList = ({ messages }: MessageListProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const streamMutation = useStreamReply();
	const { chatId } = useParams({ from: '/chats/$chatId' });

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleRetry = (userMessage: MessageOut) => {
		streamMutation.mutate({
			chatId,
			content: userMessage.content,
			retry: true,
		});
	};

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
				{messages.map((message, index) => {
					const isOrphaned =
                        message.role === 'user' &&
                        (index === messages.length - 1 || messages[index + 1]?.role !== 'assistant');

					return (
						<ChatMessage
							key={message.id}
							message={message}
							isOrphaned={isOrphaned}
							onRetry={isOrphaned ? () => handleRetry(message) : undefined}
						/>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};