import type { PerformanceSummary } from './types.ts';
import { addUTCHours } from './date.ts';
import { getClosedPositions } from './strategy-client.ts';

export async function checkStrategyTriggers(baseUrl: string, strategyId: string) {
	// const closedPositionSummary = checkClosedPositions(id, new Date())
	return checkPerformance(baseUrl, strategyId);
}

// TODO: check closed positions should return a summary of closed positions from last hour
export async function checkClosedPositions(strategyId: string, endDate: Date) {
	const closedPositions = await getClosedPositions(strategyId, addUTCHours(endDate, -1), endDate);
	console.log('closed positions in last 1h:', closedPositions.length);
}

export async function checkPerformance(baseUrl: string, strategyId: string) {
	const resp = await fetch(`${baseUrl}/strategies/${strategyId}/period-performance`);
	const summaries = (await resp.json()) as PerformanceSummary[];

	console.log(summaries);

	// sort by performance, best performing first
	summaries.sort((a, b) => b.performance - a.performance);

	// get the best performing timeframe; return it if over threshold
	const bestTimeframe = summaries[0];
	return bestTimeframe.performance > 0.05 ? bestTimeframe : undefined;
}
