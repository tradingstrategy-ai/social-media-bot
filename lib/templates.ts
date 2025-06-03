import type {
	StrategyInfo,
	StrategyTrigger,
	PositionSummary,
	PerformanceSummary
} from './types.ts';
import { formatPercent } from './formatters.ts';
import { takeScreenshot } from './screenshot.ts';
import { uploadImage } from './upload-image.ts';
import { getTimestamp } from './date.ts';
import { getStrategyUrl, fetchStrategyData } from './strategy-client.ts';

type Template = (
	strategy: StrategyInfo,
	data: Record<string, any>
) => {
	text: string;
	screenshot?: {
		path: string;
		params?: Record<string, string>;
		selector: string;
	};
};

type RenderedPost = {
	text: string;
	imageUrl?: string;
};

/**
 * Render a strategy trigger using the matching template.
 */
export async function render(
	strategyId: string,
	{ trigger, ...payload }: StrategyTrigger
): Promise<RenderedPost> {
	if (!(trigger in templates)) {
		throw new Error(`No template found for trigger ${trigger}`);
	}

	const strategy = await fetchStrategyData<StrategyInfo>(strategyId);

	const { text, screenshot } = templates[trigger](strategy, payload as any);

	if (!screenshot) return { text };

	const { path, params, selector } = screenshot;
	const pageUrl = getStrategyUrl(strategyId, path, params);
	const imageData = await takeScreenshot(pageUrl, selector);
	const { url } = await uploadImage(`${strategyId}_${trigger}_${getTimestamp()}.png`, imageData);

	return { text, imageUrl: url };
}

// each property of templates is a function that returns the rendered template for that trigger type
const templates: Record<string, Template> = {
	closed_position(strategy: StrategyInfo, data: PositionSummary) {
		const pctString = formatPercent(data.profitability);
		const url = getStrategyUrl(strategy.id, `closed-positions/${data.position_id}`);

		return {
			text: `${strategy.name} trading strategy just closed a ${data.symbol} trade for ${pctString} profit. ${url}`,
			screenshot: {
				path: `closed-positions/${data.position_id}/snapshot`,
				selector: '.position-snapshot'
			}
		};
	},

	period_performance(strategy: StrategyInfo, data: PerformanceSummary) {
		const pctString = formatPercent(data.performance);
		const url = getStrategyUrl(strategy.id);

		return {
			text: `${strategy.name} trading strategy is up ${pctString} in the past ${data.interval}. ${url}`,
			screenshot: {
				path: 'snapshot',
				params: { start: data.start, end: data.end },
				selector: '.performance-snapshot'
			}
		};
	}
};
