import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { common } from 'lowlight';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import dockerfile from 'highlight.js/lib/languages/dockerfile';

type MarkdownRendererProps = { content: string; className?: string };

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
	return (
		<div className={`max-w-none text-sm leading-6 ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkBreaks]}
				rehypePlugins={[
					[
						rehypeHighlight,
						{
							languages: { ...common, bash, yaml, dockerfile },
							aliases: { shell: 'bash', sh: 'bash', yml: 'yaml' }
						}
					]
				]}
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
					strong: ({ children }) => <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{children}</strong>,
					em:     ({ children }) => <em className="italic">{children}</em>,
					blockquote: ({ children }) => (
						<blockquote className="my-4 border-l-2 border-neutral-300 pl-4 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">
							{children}
						</blockquote>
					),
					hr: () => <hr className="my-6 border-neutral-200 dark:border-neutral-700" />,
					code: ({ className, children, ...props }) => {
						const match = /language-(\w+)/.exec(className || '');
						return match ? (
							<code className={className} {...props}>
								{children}
							</code>
						) : (
							<code className="rounded bg-neutral-100 px-1 text-sm font-mono text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" {...props}>
								{children}
							</code>
						);
					},
					pre: ({ children }) => (
						<pre className="my-4 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
							{children}
						</pre>
					)
				}}
			>
				{content}
			</ReactMarkdown>
		</div>

	);
}