import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
    text: string;
    variant?: 'default' | 'icon';
    className?: string;
}

export const CopyButton = ({ text, variant = 'default', className }: CopyButtonProps) => {
	const { t } = useLanguage();
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const showText = variant === 'default';

	return (
		<Button
			onClick={copyToClipboard}
			variant="ghost"
			size={showText ? 'sm' : 'icon'}
			className={cn(
				'h-auto gap-1.5 rounded text-xs text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 font-normal',
				showText ? 'px-2 py-1' : 'h-8 w-8 p-1',
				className
			)}
			aria-label={copied ? t('common.copied') : t('common.copy')}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 animate-in zoom-in-75 duration-200" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
			{showText && (
				<span className="transition-opacity">
					{copied ? t('common.copied') : t('common.copy')}
				</span>
			)}
		</Button>
	);
};