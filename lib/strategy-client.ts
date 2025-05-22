import { dateToUnixTs } from './date.ts';

export async function fetchStrategyEndpoint(id: string, endpoint: string) {
	const resp = await fetch(`https://${id}.tradingstrategy.ai/${endpoint}`);
	if (!resp.ok) throw new Error(resp.statusText);
	return resp.json();
}

export async function getClosedPositions(id: string, from: Date, to: Date) {
	const fromTs = dateToUnixTs(from);
	const toTs = dateToUnixTs(to);

	const state = await fetchStrategyEndpoint(id, 'state');
	const positions = Object.values(state.portfolio.closed_positions) as Record<string, any>[];

	return positions
		.filter((p) => p.closed_at >= fromTs && p.closed_at < toTs)
		.sort((a, b) => a.closed_at - b.closed_at);
}
