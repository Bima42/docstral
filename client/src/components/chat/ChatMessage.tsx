import type { MessageOut } from '@/api/types';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ChatMessage = ({ message }: { message: MessageOut }) => {
	const isUser = message.role === 'USER';
	const isAssistant = message.role === 'ASSISTANT';

	const formatTime = (iso: string) =>
		new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(iso));

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	if (isUser) {
		return (
			<div className="flex items-start justify-end gap-3">
				<div className="flex flex-col items-end max-w-2xl">
					<div className="rounded-2xl rounded-tr-sm bg-primary-500 px-4 py-3 text-white shadow-sm">
						<div className="text-sm leading-relaxed whitespace-pre-wrap">
							{message.content}
						</div>
					</div>
					<div className="mt-1 flex items-center gap-2 px-1">
						<span className="text-xs text-neutral-500">
							{formatTime(message.createdAt)}
						</span>
					</div>
				</div>
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
                    U
				</div>
			</div>
		);
	}

	if (isAssistant) {
		return (
			<div className="group/message flex items-start gap-3">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white">
                    DS
				</div>
				<div className="min-w-0 flex-1">
					<div className="text-neutral-900 dark:text-neutral-100">
						<MarkdownRenderer content={message.content} />
					</div>
					<div className="mt-2 flex items-center justify-between px-1">
						<div className="flex items-center gap-3 text-xs text-neutral-500">
							<span>{formatTime(message.createdAt)}</span>
						</div>
						<button
							onClick={() => copyToClipboard(message.content)}
							className="text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
						>
                            Copy
						</button>
					</div>
				</div>
			</div>
		);
	}

	return null;
};