import { apiJson } from '../http.ts';
import type { UserOut } from '../types.ts';

export async function verifyTokenRequest(token: string): Promise<boolean> {
	const user = await apiJson<UserOut>('/auth/verify', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
	});
	return Boolean(user?.id);
}