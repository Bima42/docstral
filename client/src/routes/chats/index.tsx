import { createFileRoute } from '@tanstack/react-router';
import { ChatLanding } from '@/pages/ChatLanding';


export const Route = createFileRoute('/chats/')({
	component: ChatLanding,
});