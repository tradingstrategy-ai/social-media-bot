import type { StrategyTrigger, PositionSummary, PerformanceSummary } from './types.ts';
import { formatPercent } from './formatters.ts';
import { takeScreenshot } from './screenshot.ts';
import { uploadImage } from './upload-image.ts';
import { getTimestamp } from './date.ts';
import { getStrategyUrl } from './strategy-client.ts';

type Template = (
	strategyId: string,
	data: Record<string, any>
) => {
	text: string;
	screenshot?: {
		path: string;
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

	const { text, screenshot } = templates[trigger](strategyId, payload as any);

	if (!screenshot) return { text };

	const pageUrl = getStrategyUrl(strategyId, screenshot.path);
	const imageData = await takeScreenshot(pageUrl, screenshot.selector);
	const { url } = await uploadImage(`${strategyId}_${trigger}_${getTimestamp()}.png`, imageData);

	return { text, imageUrl: url };
}

// each property of templates is a function that returns the rendered template for that trigger type
const templates: Record<string, Template> = {
	closed_position(strategyId: string, data: PositionSummary) {
		const pctString = formatPercent(data.profitability);
		return {
			text: `Strategy ${strategyId} just closed a ${data.symbol} trade for ${pctString} profit.`,
			// placeholder screenshot for testing
			screenshot: { path: '', selector: '.chart-container' }
		};
	},

	period_performance(strategyId: string, data: PerformanceSummary) {
		const pctString = formatPercent(data.performance);
		return {
			text: `Strategy ${strategyId} is up ${pctString} in the past ${data.interval}.`,
			// placeholder screenshot for testing
			screenshot: { path: 'performance', selector: '.chart-container' }
		};
	}
};
