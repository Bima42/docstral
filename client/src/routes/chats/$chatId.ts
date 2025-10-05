import { createFileRoute } from '@tanstack/react-router';
import { ChatContainer } from '@/components/chat/ChatContainer';

export const Route = createFileRoute('/chats/$chatId')({
	component: ChatContainer,
});