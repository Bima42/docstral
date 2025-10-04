import { createFileRoute } from '@tanstack/react-router';
import { ChatInput } from '@/components/chat/ChatInput';

function ChatsLanding() {
	return (
		<div className="flex h-screen flex-col items-center justify-center bg-surface-warm dark:bg-surface-warm px-4">
			<div className="w-full max-w-3xl space-y-6">
				<div className="flex flex-col items-center m-0">
					<img src={'/docstral-no-bg.png'} alt={'docstral-logo'} loading={'lazy'} width={120} height={80} />
				</div>
				<ChatInput chatId={undefined} />
			</div>
		</div>
	);
}

export const Route = createFileRoute('/chats/')({
	component: ChatsLanding,
});