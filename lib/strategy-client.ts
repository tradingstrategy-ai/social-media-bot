const baseUrl = process.env.TS_BASE_URL ?? 'http://localhost:5173';

export function getStrategyUrl(strategyId: string, path: string | undefined) {
	let url = `${baseUrl}/strategies/${strategyId}`;
	if (path) url += `/${path}`;
	return url;
}

export async function fetchStrategyData<T>(
	strategyId: string,
	path: string,
	searchParams: Record<string, any> = {}
) {
	const url = getStrategyUrl(strategyId, path);
	const params = new URLSearchParams(searchParams);
	const resp = await fetch(`${url}?${params}`);
	return resp.json() as Promise<T>;
}
