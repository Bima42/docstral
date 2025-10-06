import { createFileRoute } from '@tanstack/react-router';
import { ChatsLanding } from '@/pages/ChatsLanding.tsx';


export const Route = createFileRoute('/chats/')({
	component: ChatsLanding,
});