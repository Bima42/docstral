import { createFileRoute } from '@tanstack/react-router';
import { ChatInput } from '@/components/chat/ChatInput';

function ChatsLanding() {
	return (
		<div className="flex h-screen flex-col items-center justify-center bg-surface-warm dark:bg-surface-warm px-4">
			<div className="w-full max-w-3xl space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        DocStral
					</h1>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Ask me about Mistral AI models, SDKs, or implementation details.
					</p>
				</div>
				<ChatInput chatId={undefined} />
			</div>
		</div>
	);
}

export const Route = createFileRoute('/chats/')({
	component: ChatsLanding,
});