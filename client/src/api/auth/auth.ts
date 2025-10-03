import { verifyTokenAuthVerifyPost } from '@/api/client';

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