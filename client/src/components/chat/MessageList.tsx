import { useEffect } from 'react';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { ChatMessage } from './ChatMessage';
import type { MessageOut } from '@/api/client';
import { useLanguage } from '@/hooks/useLanguage.ts';

export const MessageList = ({ messages }: { messages: MessageOut[] }) => {
	const { t } = useLanguage();
	const { ref, isPinned, scrollToBottom } = useAutoScroll<HTMLDivElement>();

	useEffect(() => {
		if (isPinned) scrollToBottom();
	}, [messages.length, isPinned, scrollToBottom]);

	if (!messages.length) {
		return (
			<div className="flex-1 flex items-center justify-center px-4">
				<div className="text-center text-neutral-500">
					<div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
					<p className="text-sm">
						{t('chat.startConversationPrompt')}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div ref={ref} className="flex-1 overflow-y-auto">
			<div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6 space-y-6">
				{messages.map((m) => (
					<ChatMessage key={m.id} message={m} />
				))}
			</div>
			{!isPinned && (
				<div className="sticky bottom-20 z-10 flex justify-center">
					<button
						onClick={scrollToBottom}
						className="rounded-full bg-neutral-900/80 text-white px-3 py-1.5 text-xs shadow hover:bg-neutral-900 dark:bg-neutral-100/80 dark:text-neutral-900"
					>
						{t('chat.jumpToLatest')}
					</button>
				</div>
			)}
		</div>
	);
};