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

// Anything over 50% is "unusually high" - could be result of backend stats error
const UNUSUALLY_HIGH_PROFIT_THRESHOLD = 0.5;

const ONE_MINUTE = 50 * 1000;

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
		start: addUTCHours(endDate, -1).toISOString(),
		end: endDate.toISOString(),
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

	// fetch performance summaries
	const summaries = await fetchStrategyData<PerformanceSummary[]>(
		strategyId,
		'period-performance',
		{ end: endDate.toISOString() }
	);

	// abort if performance summary end dete > 30 minutes stale
	if (summaries.length > 0) {
		const performanceEndDate = new Date(summaries[0].end);
		if (+endDate - +performanceEndDate > 30 * ONE_MINUTE) return;
	}

	const filteredSummaries = summaries.filter((p) => {
		// filter: only consider 4h, 1d and 7d summaries
		const validTimeframe = Boolean(p.timeBucket.match(/4h|1d|7d/));

		// filter: only return values within profit thresholds
		// prettier-ignore
		const withinThresholds =
			p.performance >= PROFIT_THRESHOLD &&
			p.performance < UNUSUALLY_HIGH_PROFIT_THRESHOLD;

		return validTimeframe && withinThresholds;
	});

	// get the best performing timeframe
	filteredSummaries.sort((a, b) => b.performance - a.performance);
	const bestTimeframe = filteredSummaries[0];

	// return performance trigger if any matches found
	if (bestTimeframe) {
		return { type: 'period_performance', ...bestTimeframe };
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
