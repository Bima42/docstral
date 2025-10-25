import { MarkdownRenderer } from './MarkdownRenderer';
import { Logo } from '@/components/Logo';
import type { MessageOut } from '@/api/client';
import { useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatMessageProps {
    message: MessageOut;
    isOrphaned?: boolean;
    onRetry?: () => void;
}

export const ChatMessage = ({ message, isOrphaned, onRetry }: ChatMessageProps) => {
	const { t } = useLanguage();
	const isUser = message.role === 'user';
	const isAssistant = message.role === 'assistant';
	const [copied, setCopied] = useState(false);

	const formatTime = (iso: string) =>
		new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(iso));

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	if (isUser) {
		return (
			<div className="flex flex-col items-end gap-2">
				<div className="flex items-start justify-end gap-3">
					<div className="flex flex-col items-end max-w-2xl">
						<div className="rounded-md bg-surface-light px-4 py-3 text-neutral-700 dark:text-white shadow-sm">
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
				</div>
				{isOrphaned && onRetry && (
					<div className="w-full">
						<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm text-red-700 dark:text-red-400">
									{t('chat.messageFailed') || 'Failed to get response'}
								</p>
								<button
									onClick={onRetry}
									className="flex items-center gap-1.5 rounded-md bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 transition-colors hover:bg-red-200 dark:hover:bg-red-900/50"
								>
									<RefreshCw className="h-3.5 w-3.5" />
									{t('chat.retry')}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	if (isAssistant) {
		const hasMetrics = message.latencyMs != null || message.promptTokens != null || message.completionTokens != null;

		return (
			<div className="group/message flex items-start gap-3">
				<div className="mt-3 flex flex-col items-center m-0">
					<Logo width={30} height={15} />
				</div>
				<div className="min-w-0 flex-1">
					<div className="text-neutral-900 dark:text-neutral-100">
						<MarkdownRenderer content={message.content} />
					</div>
					<div className="mt-2 flex items-center justify-between">
						<div className="flex items-center gap-3 text-xs text-neutral-500">
							<span>{formatTime(message.createdAt)}</span>
							{hasMetrics && (
								<>
									{message.latencyMs != null && (
										<span className="text-neutral-400">
											{message.latencyMs}ms
										</span>
									)}
									{message.promptTokens != null &&
                                        message.completionTokens != null && (
										<span className="text-neutral-400">
											Tokens: ⭡{message.promptTokens} ⭣{message.completionTokens}
										</span>
									)}
								</>
							)}
						</div>
						<button
							onClick={() => copyToClipboard(message.content)}
							className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
							aria-label={copied ? t('common.copied') : t('common.copy')}
						>
							{copied ? (
								<Check className="h-3.5 w-3.5 animate-in zoom-in-75 duration-200" />
							) : (
								<Copy className="h-3.5 w-3.5" />
							)}
							<span className="transition-opacity">
								{copied ? t('common.copied') : t('common.copy')}
							</span>
						</button>
					</div>
				</div>
			</div>
		);
	}

	return null;
};