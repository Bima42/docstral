export const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

export async function verifyTokenRequest(token: string): Promise<boolean> {
	if (!API_BASE) throw new Error('VITE_API_BASE_URL is not set');
	const res = await fetch(`${API_BASE}/auth/verify`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.ok;
}