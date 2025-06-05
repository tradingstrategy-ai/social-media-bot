import type {
	PositionSummary,
	PerformanceSummary,
	ClosedPositionTrigger,
	PeriodPerformanceTrigger,
	StrategyTrigger,
	NullTrigger
} from './types.ts';
import { logger } from './logger-instance.ts';
import { addUTCHours, addUTCMinutes } from './date.ts';
import { fetchStrategyData } from './strategy-client.ts';

const PROFIT_THRESHOLD = 0.05;

// Hours to wait between period_performance triggered posts
const PERFORMANCE_COOLDOWN_HOURS = 11;

export async function checkStrategyTriggers(
	strategyId: string
): Promise<StrategyTrigger | NullTrigger> {
	const endDate = new Date();

	// check triggers in parallel
	const possibleTriggers = await Promise.all([
		checkClosedPositions(strategyId, endDate),
		checkPerformance(strategyId, endDate),
		{ type: null }
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
	if (mostProfitable?.profitability >= PROFIT_THRESHOLD) {
		return {
			type: 'closed_position',
			...mostProfitable
		};
	}
}

// returns most profitable performance summary
export async function checkPerformance(
	strategyId: string,
	endDate: Date
): Promise<PeriodPerformanceTrigger | undefined> {
	// skip if in cooldown period since last post
	if (hasRecentPerformancePosts(endDate)) return;

	const summaries = await fetchStrategyData<PerformanceSummary[]>(
		strategyId,
		'period-performance',
		{ end: endDate }
	);

	// filter out 30d summary (timeBucket too long for bot)
	const filteredSummaries = summaries.filter((p) => p.timeBucket !== '30d');

	// sort by performance, best performing first
	filteredSummaries.sort((a, b) => b.performance - a.performance);

	// get the best performing timeframe
	const bestTimeframe = filteredSummaries[0];

	// return trigger if over threshold
	if (bestTimeframe.performance >= PROFIT_THRESHOLD) {
		return {
			type: 'period_performance',
			...bestTimeframe
		};
	}
}

function hasRecentPerformancePosts(endDate: Date) {
	// cooldown period includes cooldown hours + 10 minutes to account for timing jank
	const cooldownMinutes = PERFORMANCE_COOLDOWN_HOURS * 60 + 10;
	const cutoffTime = addUTCMinutes(endDate, -cooldownMinutes);

	// find recent entrires within cooldown window with the right trigger type
	const recentEntries = logger.findRecent((entry) => {
		return new Date(entry.ts) > cutoffTime && entry.trigger.type === 'period_performance';
	});

	return recentEntries.length > 0;
}
