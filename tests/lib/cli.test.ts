import { type MockInstance, vi } from 'vitest';
import { parseArgs } from '../../lib/cli.ts';

// Mock process.argv for testing
const originalArgv = process.argv;

let exitSpy: MockInstance;

beforeEach(() => {
	// Mock process.exit to prevent actual exit during tests
	exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as typeof process.exit);
});

afterEach(() => {
	// Restore original process.argv
	process.argv = originalArgv;

	// Restore process.exit
	exitSpy.mockRestore();
});

describe('parseArgs', () => {
	describe('valid arguments', () => {
		it('should parse valid strategyId and commands', () => {
			['check', 'render', 'post'].forEach((command) => {
				process.argv = ['node', 'index.ts', 'test-strategy', command];
				expect(parseArgs()).toEqual(['test-strategy', command]);
			});
		});

		it('should parse valid arguments with logfile option', () => {
			process.argv = ['node', 'index.ts', 'test-strategy', 'check', '--logfile', '/path/to/log'];
			expect(parseArgs()).toEqual(['test-strategy', 'check']);
		});
	});

	describe('invalid arguments', () => {
		let consoleSpy: MockInstance;

		beforeEach(() => {
			consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleSpy.mockRestore();
		});

		it('should exit with error for too few arguments', () => {
			process.argv = ['node', 'index.ts'];
			parseArgs();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Usage: node index.js <strategyId> <command> [--logfile <path>]'
			);
			expect(exitSpy).toHaveBeenCalledWith(1);
		});

		it('should exit with error for too many arguments', () => {
			process.argv = ['node', 'index.ts', 'strategy', 'check', 'extra', 'args', 'here'];
			parseArgs();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Usage: node index.js <strategyId> <command> [--logfile <path>]'
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});

		it('should exit with error for invalid command', () => {
			process.argv = ['node', 'index.ts', 'test-strategy', 'invalid-command'];
			parseArgs();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error: command should be one of `check, render, post`'
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});

		it('should exit with error for malformed logfile argument', () => {
			process.argv = ['node', 'index.ts', 'test-strategy', 'check', '--wrong-flag', 'path'];
			parseArgs();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Usage: node index.js <strategyId> <command> [--logfile <path>]'
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});

		it('should exit with error for incomplete logfile argument', () => {
			process.argv = ['node', 'index.ts', 'test-strategy', 'check', '--logfile'];
			parseArgs();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Usage: node index.js <strategyId> <command> [--logfile <path>]'
			);
			expect(process.exit).toHaveBeenCalledWith(1);
		});
	});
});
