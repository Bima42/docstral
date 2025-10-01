import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chat-store';

export const ChatInput = () => {
	const [input, setInput] = useState('');
	const { addMessage, isLoading, setLoading } = useChatStore();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [input]);

	useEffect(() => { textareaRef.current?.focus(); }, []);

	const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		const userMessage = input.trim();
		setInput('');
		addMessage({ role: 'user', content: userMessage });
		setLoading(true);
		setTimeout(() => {
			addMessage({
				role: 'assistant',
				content: `This is a mock response to: "${userMessage}"\n\nIn a real implementation, this would be the actual Mistral API response with streaming support.`,
				metadata: { tokensUsed: Math.floor(Math.random() * 100) + 50, latency: Math.floor(Math.random() * 1000) + 500, model: 'mistral-large-latest' }
			});
			setLoading(false);
		}, 1500);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const charCount = input.length;
	const estimatedTokens = Math.ceil(input.split(/\s+/).filter(Boolean).length * 0.75);
	const isNearLimit = charCount > 1500;
	const isAtLimit = charCount > 2000;

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
										{charCount}/2000
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