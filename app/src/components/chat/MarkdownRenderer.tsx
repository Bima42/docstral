import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type Props = { content: string; className?: string };

function toText(children: React.ReactNode): string {
	const parts = React.Children.toArray(children);
	return parts.map((c) => (typeof c === 'string' ? c : '')).join('');
}

export function MarkdownRenderer({ content, className = '' }: Props) {
	return (
		<div className={`max-w-none text-sm leading-6 ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkBreaks]}
				rehypePlugins={[rehypeHighlight]}
				components={{
					h1: ({ children }) => <h1 className="mt-5 text-lg font-bold text-neutral-900 dark:text-neutral-100">{children}</h1>,
					h2: ({ children }) => <h2 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">{children}</h2>,
					h3: ({ children }) => <h3 className="mt-4 text-base font-medium text-neutral-900 dark:text-neutral-100">{children}</h3>,
					p:  ({ children }) => <p className="mt-3">{children}</p>,
					ul: ({ children }) => <ul className="my-3 ml-6 list-disc [&>li]:mt-1">{children}</ul>,
					ol: ({ children }) => <ol className="my-3 ml-6 list-decimal [&>li]:mt-1">{children}</ol>,
					a:  ({ href, children }) => (
						<a href={href} target="_blank" rel="noopener noreferrer"
							className="font-medium text-primary-600 underline underline-offset-4 hover:text-primary-500">
							{children}
						</a>
					),
					code: ({ inline, className: codeClass, children }) => {
						const codeText = toText(children);
						if (inline) {
							return (
								<code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
									{codeText}
								</code>
							);
						}
						const lang = codeClass?.replace('language-', '') || 'text';
						const handleCopy = async () => {
							try { await navigator.clipboard.writeText(codeText); } catch (e) { console.error('copy failed', e); }
						};
						return (
							<div className="my-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
								<div className="flex items-center justify-between bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
									<span className="uppercase tracking-wide">{lang}</span>
									<button onClick={handleCopy} className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                                        Copy
									</button>
								</div>
								<pre className="overflow-x-auto bg-transparent p-3 text-sm">
									<code className={`hljs ${codeClass || ''}`}>{codeText}</code>
								</pre>
							</div>
						);
					},
					strong: ({ children }) => <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{children}</strong>,
					em:     ({ children }) => <em className="italic">{children}</em>,
					blockquote: ({ children }) => (
						<blockquote className="my-4 border-l-2 border-neutral-300 pl-4 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">
							{children}
						</blockquote>
					),
					hr: () => <hr className="my-6 border-neutral-200 dark:border-neutral-700" />
				}}
			>
				{content}
			</ReactMarkdown>
		</div>

	);
}