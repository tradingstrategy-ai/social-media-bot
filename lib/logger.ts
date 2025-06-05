import type { StrategyTrigger, NullTrigger } from './types.ts';
import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname } from 'node:path';
import type { RenderedPost } from './templates.ts';

export interface PlatformResult {
	platform: string;
	success: boolean;
	post_id?: string;
	error?: string;
}

export interface ExecutionLogEntry {
	ts: string;
	trigger: StrategyTrigger | NullTrigger;
	content?: RenderedPost;
	posts?: PlatformResult[];
}

/**
 * Logger class for handling execution logging
 */
export class Logger {
	private logFile?: string;

	constructor(logFile?: string) {
		this.logFile = logFile;
	}

	/**
	 * Log an execution event
	 *
	 * @param trigger The trigger that caused this execution
	 * @param content Rendered content (optional)
	 * @param posts Array of platform results from posting attempts (optional)
	 */
	log(
		trigger: StrategyTrigger | NullTrigger,
		content?: RenderedPost,
		posts?: PlatformResult[]
	): void {
		// create log entry
		const entry: ExecutionLogEntry = {
			ts: new Date().toISOString(),
			trigger,
			content,
			posts
		};

		const jsonLine = JSON.stringify(entry) + '\n';

		if (this.logFile) {
			// ensure log directory exists
			mkdirSync(dirname(this.logFile), { recursive: true });
			// append JSONL entry to file
			appendFileSync(this.logFile, jsonLine);
		} else {
			// log to stdout
			process.stdout.write(jsonLine);
		}
	}

	/**
	 * Find recent log entries matching the given criteria
	 * Uses `tail` command for efficient reading of recent entries from large log files.
	 *
	 * @param matcher Function to test each log entry
	 * @param maxEntries Maximum number of log entries to check
	 * @returns Array of matching log entries in reverse chronological order
	 */
	findRecent(
		matcher: (entry: ExecutionLogEntry) => boolean,
		maxEntries = 100
	): ExecutionLogEntry[] {
		if (!this.logFile) return [];

		if (!existsSync(this.logFile)) return [];

		// use tail to efficiently get last n entries
		let output: string;
		try {
			output = execSync(`tail -n ${maxEntries} "${this.logFile}"`, {
				encoding: 'utf8',
				stdio: 'pipe'
			});
		} catch (error) {
			console.warn(`Error reading log file ${this.logFile}: ${error}`);
			return [];
		}

		const lines = output.trim().split('\n');

		return lines.reduceRight<ExecutionLogEntry[]>((acc, line) => {
			const entry = processLogLine(line, matcher);
			if (entry) acc.push(entry);
			return acc;
		}, []);
	}
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
