import { createFileRoute } from '@tanstack/react-router';
import { ChatLanding } from '@/pages/ChatLanding.tsx';


export const Route = createFileRoute('/chats/')({
	component: ChatLanding,
});