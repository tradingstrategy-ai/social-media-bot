import type {
	PositionSummary,
	PerformanceSummary,
	ClosedPositionTrigger,
	PeriodPerformanceTrigger,
	StrategyTrigger
} from './types.ts';
import { addUTCHours } from './date.ts';
import { fetchStrategyData } from './strategy-client.ts';

const PROFIT_THRESHOLD = 0.05;

export async function checkStrategyTriggers(
	baseUrl: string,
	strategyId: string
): Promise<StrategyTrigger | undefined> {
	const closedPositionSummary = await checkClosedPositions(baseUrl, strategyId, new Date());
	return closedPositionSummary ?? checkPerformance(baseUrl, strategyId);
}

// returns most profitable closed position (summary) from last hour
export async function checkClosedPositions(
	baseUrl: string,
	strategyId: string,
	endDate: Date
): Promise<ClosedPositionTrigger | undefined> {
	const positionsAlt = await fetchStrategyData<PositionSummary[]>(
		baseUrl,
		strategyId,
		'closed-positions',
		{
			start: addUTCHours(endDate, -1),
			end: endDate,
			sort: 'profitability',
			direction: 'desc'
		}
	);

	// get the most profitable positions
	const mostProfitable = positionsAlt[0];

	// return summary data if over threshold
	if (mostProfitable?.profitability > PROFIT_THRESHOLD) {
		return {
			trigger: 'closed_position',
			...mostProfitable
		};
	}
}

// returns most profitable performance summary
export async function checkPerformance(
	baseUrl: string,
	strategyId: string
): Promise<PeriodPerformanceTrigger | undefined> {
	const summaries = await fetchStrategyData<PerformanceSummary[]>(
		baseUrl,
		strategyId,
		'period-performance'
	);

	// sort by performance, best performing first
	summaries.sort((a, b) => b.performance - a.performance);

	// get the best performing timeframe
	const bestTimeframe = summaries[0];

	// return it if over threshold
	if (bestTimeframe.performance > PROFIT_THRESHOLD) {
		return {
			trigger: 'period_performance',
			...bestTimeframe
		};
	}
}
