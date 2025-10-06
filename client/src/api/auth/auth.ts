import { verifyTokenAuthVerifyPost } from '@/api/client';
import { TOKEN_STORAGE_KEY } from '@/config';

export function getAuthHeaders() {
	const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function verifyTokenRequest(token: string): Promise<boolean> {
	try {
		const { data } = await verifyTokenAuthVerifyPost({
			headers: { Authorization: `Bearer ${token}` },
		});
		return Boolean(data?.id);
	} catch {
		return false;
	}
}