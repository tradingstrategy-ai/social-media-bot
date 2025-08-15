import './lib/backtest.ts';
import type { StrategyTrigger } from './lib/types.ts';
import { parseArgs } from './lib/cli.ts';
import { logger } from './lib/logger-instance.ts';
import { checkStrategyTriggers } from './lib/strategy-triggers.ts';
import { render } from './lib/templates.ts';
import { postToFarcaster } from './lib/farcaster.ts';

/***************************************
 * Main script
 **************************************/

const [strategyId, command] = parseArgs();
const result = await main(strategyId, command);
logger.log(result.trigger, result.content, result.posts);

/***************************************
 * Core logic
 **************************************/

async function main(strategyId: string, command: string) {
	// check for any social media triggers
	const trigger = await checkStrategyTriggers(strategyId);

	// if "check" command or null trigger, return early
	if (command === 'check' || trigger.type === null) {
		return { trigger };
	}

	// render the social media post
	const content = await render(strategyId, trigger as StrategyTrigger);

	// if "render" command, return early
	if (command === 'render') {
		return { trigger, content };
	}

	// submit the Farcaster post (text and image)
	const post = await postToFarcaster({
		text: content.text,
		embeds: [{ url: content.imageUrl }]
	});

	return { trigger, content, posts: [post] };
}
