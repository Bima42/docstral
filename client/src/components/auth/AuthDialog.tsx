import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/hooks/useLanguage.ts';

export function AuthDialog() {
	const { t } = useLanguage();
	const { isVerified, status, error, verify } = useAuth();
	const [tokenInput, setTokenInput] = useState('');
	const [submitErr, setSubmitErr] = useState<string | undefined>(undefined);

	const open = useMemo(() => !isVerified, [isVerified]);

	useEffect(() => {
		setSubmitErr(undefined);
	}, [tokenInput]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitErr(undefined);
		const ok = await verify(tokenInput.trim());
		if (!ok) setSubmitErr(t('auth.dialog.invalidToken'));
	};

	return (
		<Dialog open={open}>
			<DialogContent
				onPointerDownOutside={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				className={[
					'sm:max-w-md w-[92vw]',
					'rounded-xl',
					'border border-neutral-200 dark:border-sidebar-border',
					'bg-surface-light',
					'text-neutral-900 dark:text-sidebar-foreground',
					'shadow-2xl',
					'p-6',
				].join(' ')}
			>
				<DialogHeader className="space-y-1">
					<DialogTitle className="text-lg font-semibold">
						{t('auth.dialog.title')}
					</DialogTitle>
					<DialogDescription className="text--neutral-600 dark:text-neutral-400">
						{t('auth.dialog.message')}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="mt-4 grid gap-3">
					<label
						htmlFor="token"
						className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
					>
						{t('auth.dialog.inputLabel')}
					</label>

					<Input
						id="token"
						type="password"
						autoFocus
						placeholder="••••••••"
						value={tokenInput}
						onChange={(e) => setTokenInput(e.target.value)}
						disabled={status === 'checking'}
						className={[
							'h-10',
							'bg-surface-neutral dark:bg-[hsl(240_9%_12%',
							'border border-neutral-200 dark:border-sidebar-border',
							'text-neutral-900 dark:text-sidebar-foreground',
							'placeholder-neutral-400',
							'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-0',
						].join(' ')}
					/>

					{(submitErr || error) && (
						<p className="text-sm text-red-600">
							{submitErr || error}
						</p>
					)}

					<Button
						type="submit"
						disabled={!tokenInput || status === 'checking'}
						className={[
							'mt-1',
							'h-10',
							'bg-primary-500 hover:bg-primary-600',
							'text-white',
							'disabled:opacity-60 disabled:cursor-not-allowed',
						].join(' ')}
					>
						{status === 'checking' ? t('common.verifying') : t('common.verify')}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}