import { createFileRoute } from '@tanstack/react-router';
import { ChatContainer } from '@/components/chat/ChatContainer.tsx';

export const Route = createFileRoute('/chats/$chatId')({
	component: ChatContainer,
});