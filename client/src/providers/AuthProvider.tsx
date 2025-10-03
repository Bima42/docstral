import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthDialog } from '@/components/auth/AuthDialog.tsx';
import { verifyTokenRequest } from '@/api/auth/auth.ts';
import { setTokenProvider } from '@/api/http.ts';
import { useNavigate } from '@tanstack/react-router';

type AuthState = {
    token: string | null;
    isVerified: boolean;
    status: 'idle' | 'checking' | 'verified' | 'error';
    error?: string;
    verify: (token: string) => Promise<boolean>;
    logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const STORAGE_KEY = 'docstral_auth_token';


export function AuthProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));
	const [status, setStatus] = useState<AuthState['status']>(token ? 'checking' : 'idle');
	const [error, setError] = useState<string | undefined>(undefined);

	useEffect(() => {
		setTokenProvider(() => token);
	}, [token]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!token) return;
			setStatus('checking');
			setError(undefined);
			const ok = await verifyTokenRequest(token).catch((e) => {
				console.error('verify failed', e);
				return false;
			});
			if (cancelled) return;
			if (ok) {
				setStatus('verified');
			} else {
				setStatus('error');
				setError('Token invalid or expired');
				setToken(null);
				sessionStorage.removeItem(STORAGE_KEY);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [token]);

	const verify = useCallback(async (tok: string) => {
		setStatus('checking');
		setError(undefined);
		const ok = await verifyTokenRequest(tok).catch(() => {
			return false;
		});
		if (ok) {
			setToken(tok);
			sessionStorage.setItem(STORAGE_KEY, tok);
			setStatus('verified');
			navigate({ to: '/chats' });
			return true;
		} else {
			setStatus('error');
			setError('Token invalid');
			return false;
		}
	}, [navigate]);

	const logout = () => {
		navigate({ to: '/' });
		setTokenProvider(() => null);
		setToken(null);
		sessionStorage.removeItem(STORAGE_KEY);
		setStatus('idle');
		setError(undefined);
	};


	const value = useMemo<AuthState>(() => ({
		token,
		isVerified: status === 'verified',
		status,
		error,
		verify,
		logout,
	}), [token, status, error, verify]);

	return <AuthContext.Provider value={value}>
		{status !== 'verified' && <AuthDialog />}
		{children}
	</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}