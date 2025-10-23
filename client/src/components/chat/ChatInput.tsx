import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatInputProps {
    onSubmit: (content: string) => void | Promise<void>;
    disabled?: boolean;
}

export const ChatInput = ({ onSubmit, disabled = false }: ChatInputProps) => {
	const { t } = useLanguage();
	const [input, setInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

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
		if (!input.trim() || isSubmitting || disabled) return;

		const userMessage = input.trim();
		setInput('');
		setIsSubmitting(true);

		try {
			await onSubmit(userMessage);
		} catch (err) {
			console.error('Submit failed:', err);
			setInput(userMessage);
		} finally {
			setIsSubmitting(false);
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
	const isLoading = isSubmitting || disabled;

	return (
		<div className="sticky bottom-0 z-20 bg-surface-warm backdrop-blur-md">
			<div className="mx-auto max-w-4xl px-4 py-3 pb-[env(safe-area-inset-bottom)] sm:px-6">
				<form onSubmit={handleSubmit} className="relative">
					<div className="relative rounded-md border border-sidebar-border bg-surface-light transition-all focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:bg-neutral-900">
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={t('chat.inputPlaceholder')}
							disabled={isSubmitting}
							className="max-h-40 min-h-[56px] w-full resize-none bg-transparent px-4 py-4 pr-14 text-sm text-neutral-900 placeholder-neutral-500 outline-none dark:text-neutral-100 dark:placeholder-neutral-400"
							style={{ scrollbarWidth: 'thin' }}
						/>
						<button
							type="submit"
							disabled={!input.trim() || isLoading}
							className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-700"
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
					<div className="mt-2 mb-1 flex items-center justify-between px-1">
						<div className="flex items-center gap-4 text-xs text-neutral-500">
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
								<span>{t('common.processing')}</span>
							</div>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};