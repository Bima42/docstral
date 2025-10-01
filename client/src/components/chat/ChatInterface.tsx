import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChatStore } from '@/stores/chat-store';

export const ChatInterface = () => {
	const { error } = useChatStore();

	return (
		<div className="flex h-screen flex-col bg-surface-warm dark:bg-surface-warm">
			<ChatHeader />
			<MessageList />
			{error && (
				<div className="border-t border-red-200 bg-red-50 p-4 dark:border-red-700/50 dark:bg-red-950/20">
					<div className="mx-auto flex max-w-4xl items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className="h-2 w-2 rounded-full bg-red-500" />
							<span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
						</div>
						<button
							onClick={() => useChatStore.getState().setError(null)}
							className="text-sm text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
						>
                            Dismiss
						</button>
					</div>
				</div>
			)}
			<ChatInput />
		</div>
	);
};