import type { StrategyTrigger, PositionSummary, PerformanceSummary } from './types.ts';
import { formatPercent } from './formatters.ts';

/**
 * Render a strategy trigger using the matching template.
 */
export function render(strategyId: string, { trigger, ...payload }: StrategyTrigger) {
	if (trigger in templates) {
		return templates[trigger](strategyId, payload as any);
	}
	throw new Error(`No template found for trigger ${trigger}`);
}

// each property of templates is a function that returns the rendered template for that trigger type
const templates = {
	closed_position(strategyId: string, data: PositionSummary) {
		const pctString = formatPercent(data.profitability);
		return {
			text: `Strategy ${strategyId} just closed a ${data.symbol} trade for ${pctString} profit.`
		};
	},

	period_performance(strategyId: string, data: PerformanceSummary) {
		const pctString = formatPercent(data.performance);
		return {
			text: `Strategy ${strategyId} is up ${pctString} in the past ${data.interval}.`
		};
	}
};
