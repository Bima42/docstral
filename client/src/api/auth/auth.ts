import { type UserOut, verifyTokenAuthVerifyPost } from '@/api/client';
import { TOKEN_STORAGE_KEY } from '@/config';

export function getAuthHeaders() {
	const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function verifyTokenRequest(token: string): Promise<UserOut | undefined > {
	try {
		const { data } = await verifyTokenAuthVerifyPost({
			headers: { Authorization: `Bearer ${token}` },
		});
		return data;
	} catch {
		return ;
	}
}