import { MarkdownRenderer } from './MarkdownRenderer';
import { Logo } from '@/components/Logo';
import type { MessageOut } from '@/api/client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export const ChatMessage = ({ message }: { message: MessageOut }) => {
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
				<div className="flex flex-col items-center m-0">
					<Logo width={30} height={15} />
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