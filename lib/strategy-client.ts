const baseUrl = process.env.TS_BASE_URL ?? 'http://localhost:5173';

export function getStrategyUrl(
	strategyId: string,
	path?: string | undefined,
	params?: Record<string, any>
) {
	let url = `${baseUrl}/strategies/${strategyId}`;
	if (path) url += `/${path}`;
	if (params) url += '?' + new URLSearchParams(params);
	return url;
}

export async function fetchStrategyData<T>(
	strategyId: string,
	path?: string | undefined,
	searchParams?: Record<string, any>
) {
	const url = getStrategyUrl(strategyId, path, searchParams);
	const resp = await fetch(`${url}`);
	return resp.json() as Promise<T>;
}
