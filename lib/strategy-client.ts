export async function fetchStrategyData<T>(
	baseUrl: string,
	strategyId: string,
	route: string,
	searchParams: Record<string, any> = {}
) {
	const urlParams = new URLSearchParams(searchParams);
	const resp = await fetch(`${baseUrl}/strategies/${strategyId}/${route}?${urlParams}`);
	return resp.json() as Promise<T>;
}
