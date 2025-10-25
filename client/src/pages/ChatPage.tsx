import { ChatInterface } from '../components/chat/ChatInterface.tsx';

export const ChatPage = () => {
	return (
		<div className="flex h-screen bg-surface-warm dark:bg-surface-warm">
			<main className="flex-1 flex flex-col min-w-0">
				<ChatInterface />
			</main>
		</div>
	);
};
