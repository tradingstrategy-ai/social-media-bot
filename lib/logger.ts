import type { StrategyTrigger, NullTrigger } from './types.ts';
import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { isBacktest } from './backtest.ts';

const logDir = './logs';

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

/**
 * Get the log file path for a strategy
 */
function getLogFilePath(strategyId: string): string {
	const suffix = isBacktest ? '-backtest' : '';
	return join(logDir, `${strategyId}${suffix}.jsonl`);
}

/**
 * Log an execution event for a strategy
 *
 * @param strategyId Unique identifier for the strategy
 * @param trigger The trigger that caused this execution
 * @param posts Array of platform results from posting attempts (defaults to empty array)
 */
export function log(
	strategyId: string,
	trigger: StrategyTrigger | NullTrigger,
	posts: PlatformResult[] = []
): void {
	const logFile = getLogFilePath(strategyId);

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

/**
 * Process a single log line and return matching entry or null
 */
function processLogLine(
	line: string,
	matcher: (entry: ExecutionLogEntry) => boolean
): ExecutionLogEntry | undefined {
	if (line.length === 0) return;

	let entry: ExecutionLogEntry;
	try {
		entry = JSON.parse(line);
	} catch (error) {
		console.warn(`Skipping malformed log entry: ${error}`);
		return;
	}

	return matcher(entry) ? entry : undefined;
}

/**
 * Find recent log entries matching the given criteria
 * Uses `tail` command for efficient reading of recent entries from large log files.
 *
 * @param strategyId Strategy ID to query logs for
 * @param matcher Function to test each log entry
 * @param maxEntries Maximum number of log entries to check
 * @returns Array of matching log entries in reverse chronological order
 */
export function findRecentLogs(
	strategyId: string,
	matcher: (entry: ExecutionLogEntry) => boolean,
	maxEntries = 100
): ExecutionLogEntry[] {
	const logFile = getLogFilePath(strategyId);
	if (!existsSync(logFile)) return [];

	// use tail to efficiently get last n entries
	let output: string;
	try {
		output = execSync(`tail -n ${maxEntries} "${logFile}"`, {
			encoding: 'utf8',
			stdio: 'pipe'
		});
	} catch (error) {
		console.warn(`Error reading log file ${logFile}: ${error}`);
		return [];
	}

	const lines = output.trim().split('\n');

	return lines.reduceRight<ExecutionLogEntry[]>((acc, line) => {
		const entry = processLogLine(line, matcher);
		if (entry) acc.push(entry);
		return acc;
	}, []);
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
