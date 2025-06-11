import { formatPercent } from '../../lib/formatters.ts';

describe('formatPercent', () => {
	it('should format basic percentages correctly', () => {
		expect(formatPercent(0.05)).toBe('5.0%');
		expect(formatPercent(0.1)).toBe('10.0%');
		expect(formatPercent(0.25)).toBe('25.0%');
		expect(formatPercent(1.0)).toBe('100.0%');
	});

	it('should handle negative percentages', () => {
		expect(formatPercent(-0.05)).toBe('-5.0%');
		expect(formatPercent(-0.1)).toBe('-10.0%');
	});

	it('should handle zero', () => {
		expect(formatPercent(0)).toBe('0.0%');
	});

	it('should handle very small numbers', () => {
		expect(formatPercent(0.001)).toBe('0.1%');
		expect(formatPercent(0.0001)).toBe('0.0%');
	});

	it('should handle very large numbers', () => {
		expect(formatPercent(2.5)).toBe('250.0%');
		expect(formatPercent(10)).toBe('1,000.0%');
	});

	it('should respect custom minimum digits', () => {
		expect(formatPercent(0.05, 0)).toBe('5%');
		expect(formatPercent(0.05, 2)).toBe('5.00%');
		expect(formatPercent(0.05, 3)).toBe('5.000%');
	});

	it('should respect custom maximum digits', () => {
		expect(formatPercent(0.05123, 1, 3)).toBe('5.123%');
		expect(formatPercent(0.05123, 1, 2)).toBe('5.12%');
		expect(formatPercent(0.05123, 1, 1)).toBe('5.1%');
	});

	it('should handle precision edge cases', () => {
		// When minDigits > maxDigits, this should throw an error due to API constraints
		expect(() => formatPercent(0.05, 2, 1)).toThrow();
	});

	it('should handle decimal precision correctly', () => {
		expect(formatPercent(0.0512, 1, 2)).toBe('5.12%');
		expect(formatPercent(0.051234, 1, 2)).toBe('5.12%'); // Should round
		expect(formatPercent(0.051289, 1, 2)).toBe('5.13%'); // Should round up
	});
});