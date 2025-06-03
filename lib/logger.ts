import type { StrategyTrigger, NullTrigger } from './types.ts';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { isBacktest } from './backtest.ts';

export interface PlatformResult {
	platform: string;
	success: boolean;
	post_id?: string;
	error?: string;
}

export interface ExecutionLogEntry {
	ts: string;
	trigger: StrategyTrigger | NullTrigger;
	posts: PlatformResult[];
}

export function log(
	strategyId: string,
	trigger: StrategyTrigger | NullTrigger,
	posts: PlatformResult[] = []
): void {
	const logDir = './logs';
	const suffix = isBacktest ? '-backtest' : '';
	const logFile = join(logDir, `${strategyId}${suffix}.jsonl`);

	// ensure log directory exists
	mkdirSync(logDir, { recursive: true });

	// create log entry
	const entry: ExecutionLogEntry = {
		ts: new Date().toISOString(),
		trigger,
		posts
	};

	// append JSONL entry
	const jsonLine = JSON.stringify(entry) + '\n';
	appendFileSync(logFile, jsonLine);
}

// helper to create platform result
export function createPlatformResult(
	platform: string,
	success: boolean,
	post_id?: string,
	error?: string
): PlatformResult {
	return {
		platform,
		success,
		...(post_id && { post_id }),
		...(error && { error })
	};
}
