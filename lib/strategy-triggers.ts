import type { PerformanceSummary } from './types.ts';
import { addUTCHours } from './date.ts';
import { getClosedPositions } from './strategy-client.ts';

const PROFIT_THRESHOLD = 0.05;

export async function checkStrategyTriggers(baseUrl: string, strategyId: string) {
	const closedPositionSummary = await checkClosedPositions(strategyId, new Date());
	return closedPositionSummary ?? checkPerformance(baseUrl, strategyId);
}

// returns most profitable closed position (summary) from last hour
export async function checkClosedPositions(strategyId: string, endDate: Date) {
	// get positions closed in the last hour
	const positions = await getClosedPositions(strategyId, addUTCHours(endDate, -1), endDate);

	// filter only spot positions
	const spotPositions = positions.filter((p) => p.pair.kind === 'spot_market_hold');

	// sort by profitability (most profitable first)
	spotPositions.sort((a, b) => b.stats.profitability - a.stats.profitability);

	// get the most profitable positions
	const mostProfitable = spotPositions[0];

	// return summary data if over threshold
	if (mostProfitable?.stats.profitability > PROFIT_THRESHOLD) {
		return {
			position_id: mostProfitable.position_id,
			closed_at: mostProfitable.closed_at,
			profitability: mostProfitable.stats.profitability
		};
	}
}

// returns most profitable performance summary
export async function checkPerformance(baseUrl: string, strategyId: string) {
	const resp = await fetch(`${baseUrl}/strategies/${strategyId}/period-performance`);
	const summaries = (await resp.json()) as PerformanceSummary[];

	// sort by performance, best performing first
	summaries.sort((a, b) => b.performance - a.performance);

	// get the best performing timeframe
	const bestTimeframe = summaries[0];

	// return it if over threshold
	if (bestTimeframe.performance > PROFIT_THRESHOLD) {
		return bestTimeframe;
	}
}
