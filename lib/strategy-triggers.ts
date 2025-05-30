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
	strategyId: string
): Promise<StrategyTrigger | undefined> {
	const endDate = new Date();
	// check triggers in parallel
	const possibleTriggers = await Promise.all([
		checkClosedPositions(strategyId, endDate),
		checkPerformance(strategyId, endDate)
	]);

	// return the first successful trigger
	return possibleTriggers.find((t) => t);
}

// returns most profitable closed position (summary) from last hour
export async function checkClosedPositions(
	strategyId: string,
	endDate: Date
): Promise<ClosedPositionTrigger | undefined> {
	const positionsAlt = await fetchStrategyData<PositionSummary[]>(strategyId, 'closed-positions', {
		start: addUTCHours(endDate, -1),
		end: endDate,
		sort: 'profitability',
		direction: 'desc'
	});

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
	strategyId: string,
	endDate: Date
): Promise<PeriodPerformanceTrigger | undefined> {
	const summaries = await fetchStrategyData<PerformanceSummary[]>(
		strategyId,
		'period-performance',
		{ end: endDate }
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
