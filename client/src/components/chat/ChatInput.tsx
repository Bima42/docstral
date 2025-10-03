import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStreamReply } from '@/api/chat/queries';
import { createChat } from '@/api/chat/chat';
import { queryClient } from '@/lib/queryClient';
import type { ChatDetail } from '@/api/types';

interface ChatInputProps {
    chatId: string | undefined;
}

export const ChatInput = ({ chatId }: ChatInputProps) => {
	const [input, setInput] = useState('');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const navigate = useNavigate();

	const streamMutation = useStreamReply();

	const isLoading = streamMutation.isPending;

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [input]);

	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		setInput('');

		if (!chatId) {
			try {
				const newChat = await createChat({ title: userMessage.slice(0, 50) });
				const newChatId = newChat.id;

				queryClient.setQueryData<ChatDetail>(['chat', newChatId], {
					...newChat,
					messages: [],
				});

				await streamMutation.mutateAsync({
					chatId: newChatId,
					payload: { content: userMessage },
				});

				navigate({
					to: '/chats/$chatId',
					params: { chatId: newChatId },
					replace: true,
				});
			} catch (err) {
				console.error('First message flow failed:', err);
				setInput(userMessage);
			}
		} else {
			streamMutation.mutate({
				chatId,
				payload: { content: userMessage },
			});
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const MAX_CHAR_LIMIT = 2000;
	const charCount = input.length;
	const estimatedTokens = Math.ceil(input.split(/\s+/).filter(Boolean).length * 0.75);
	const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.9;
	const isAtLimit = charCount > MAX_CHAR_LIMIT;

	return (
		<div className="sticky bottom-0 z-20 bg-surface-warm/80 backdrop-blur-md">
			<div className="mx-auto max-w-4xl px-4 py-3 pb-[env(safe-area-inset-bottom)] sm:px-6">
				<form onSubmit={handleSubmit} className="relative">
					<div className="relative rounded-2xl border border-sidebar-border bg-surface-light transition-all focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:bg-neutral-900">
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Ask me about Mistral AI models, SDKs, or implementation..."
							disabled={isLoading}
							className="max-h-40 min-h-[56px] w-full resize-none bg-transparent px-4 py-4 pr-14 text-neutral-900 placeholder-neutral-500 outline-none dark:text-neutral-100 dark:placeholder-neutral-400"
							style={{ scrollbarWidth: 'thin' }}
						/>
						<button
							type="submit"
							disabled={!input.trim() || isLoading}
							className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-700"
							aria-label="Send"
						>
							{isLoading ? (
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : (
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
								</svg>
							)}
						</button>
					</div>
					<div className="mt-2 flex items-center justify-between px-1">
						<div className="flex items-center gap-4 text-xs text-neutral-500">
							<span>Enter to send, Shift+Enter for newline</span>
							{input.trim() && (
								<span className="flex items-center gap-2">
									<span>~{estimatedTokens} tokens</span>
									<span className="h-1 w-1 rounded-full bg-neutral-400" />
									<span className={isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : ''}>
										{charCount}/{MAX_CHAR_LIMIT}
									</span>
								</span>
							)}
						</div>
						{isLoading && (
							<div className="flex items-center gap-2 text-xs text-primary-600">
								<span className="h-1 w-1 animate-pulse rounded-full bg-primary-500" />
								<span>Processing...</span>
							</div>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};