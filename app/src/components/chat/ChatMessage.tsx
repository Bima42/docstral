import React from 'react';
import { type ChatMessage as ChatMessageType } from '../../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps { message: ChatMessageType }

export const ChatMessage = ({ message }: ChatMessageProps) => {
	const isUser = message.role === 'user';
	const isAssistant = message.role === 'assistant';

	const formatTime = (date: Date) =>
		new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));

	const copyToClipboard = async (text: string) => {
		try { await navigator.clipboard.writeText(text); } catch (err) { console.error('Failed to copy:', err); }
	};

	if (isUser) {
		return (
			<div className="flex items-start justify-end gap-3">
				<div className="flex flex-col items-end max-w-2xl">
					<div className="rounded-2xl rounded-tr-sm bg-primary-500 px-4 py-3 text-white shadow-sm">
						<div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
					</div>
					<div className="mt-1 flex items-center gap-2 px-1">
						<span className="text-xs text-neutral-500">{formatTime(message.timestamp)}</span>
						{message.error && (
							<span className="flex items-center gap-1 text-xs text-red-500">
								<span className="h-1 w-1 rounded-full bg-red-500" /> Failed to send
							</span>
						)}
					</div>
				</div>
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">U</div>
			</div>
		);
	}

	if (isAssistant) {
		return (
			<div className="group/message flex items-start gap-3">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white">DS</div>
				<div className="min-w-0 flex-1">
					<div className={`text-neutral-900 dark:text-neutral-100 ${message.isStreaming ? 'animate-pulse' : ''}`}>
						<MarkdownRenderer content={message.content} />
					</div>
					<div className="mt-2 flex items-center justify-between px-1">
						<div className="flex items-center gap-3 text-xs text-neutral-500">
							<span>{formatTime(message.timestamp)}</span>
							{message.metadata?.latency && (
								<span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-amber-500" />{message.metadata.latency}ms</span>
							)}
							{message.metadata?.tokensUsed && (
								<span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-warm-700" />{message.metadata.tokensUsed} tokens</span>
							)}
							{message.metadata?.model && (
								<span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-neutral-400" />{message.metadata.model}</span>
							)}
							{message.isStreaming && (
								<span className="flex items-center gap-1 text-primary-500"><span className="h-1 w-1 animate-pulse rounded-full bg-primary-500" />Streaming...</span>
							)}
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