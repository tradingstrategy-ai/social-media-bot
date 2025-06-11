import { vi } from 'vitest';
import { getTimestamp, addUTCHours, addUTCMinutes } from '../../lib/date.ts';

describe('getTimestamp', () => {
	it('should return timestamp in expected format', () => {
		// Format should be YYYY-MM-DD_HH-MM
		expect(getTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/);
	});

	it('should return current time', () => {
		const mockDate = new Date('2024-01-15T14:30:00.000Z');
		vi.setSystemTime(mockDate);
		expect(getTimestamp()).toBe('2024-01-15_14-30');
		vi.useRealTimers();
	});
});

describe('addUTCHours', () => {
	it('should add positive hours correctly', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const result = addUTCHours(baseDate, 5);
		expect(result.toISOString()).toBe('2023-01-01T17:00:00.000Z');
	});

	it('should add negative hours correctly', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const result = addUTCHours(baseDate, -3);
		expect(result.toISOString()).toBe('2023-01-01T09:00:00.000Z');
	});

	it('should handle day boundary crossing', () => {
		const baseDate = new Date('2023-01-01T22:00:00.000Z');
		const result = addUTCHours(baseDate, 5);
		expect(result.toISOString()).toBe('2023-01-02T03:00:00.000Z');
	});

	it('should handle month boundary crossing', () => {
		const baseDate = new Date('2023-01-31T23:00:00.000Z');
		const result = addUTCHours(baseDate, 2);
		expect(result.toISOString()).toBe('2023-02-01T01:00:00.000Z');
	});

	it('should not mutate original date', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const originalTime = baseDate.getTime();
		addUTCHours(baseDate, 5);
		expect(baseDate.getTime()).toBe(originalTime);
	});

	it('should handle zero hours', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const result = addUTCHours(baseDate, 0);
		expect(result.toISOString()).toBe(baseDate.toISOString());
	});

	it('should handle DST transitions correctly (spring forward)', () => {
		// March 12, 2023 was DST transition in US (spring forward at 2 AM)
		// Using UTC methods should be unaffected by local DST changes
		const baseDate = new Date('2023-03-12T06:00:00.000Z'); // 1 AM EST / 6 AM UTC
		const result = addUTCHours(baseDate, 2);
		expect(result.toISOString()).toBe('2023-03-12T08:00:00.000Z'); // 3 AM EST / 8 AM UTC
	});

	it('should handle DST transitions correctly (fall back)', () => {
		// November 5, 2023 was DST transition in US (fall back at 2 AM)
		// Using UTC methods should be unaffected by local DST changes
		const baseDate = new Date('2023-11-05T05:00:00.000Z'); // 1 AM EST / 5 AM UTC
		const result = addUTCHours(baseDate, 2);
		expect(result.toISOString()).toBe('2023-11-05T07:00:00.000Z'); // 2 AM EST / 7 AM UTC
	});
});

describe('addUTCMinutes', () => {
	it('should add positive minutes correctly', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const result = addUTCMinutes(baseDate, 45);
		expect(result.toISOString()).toBe('2023-01-01T12:45:00.000Z');
	});

	it('should add negative minutes correctly', () => {
		const baseDate = new Date('2023-01-01T12:30:00.000Z');
		const result = addUTCMinutes(baseDate, -15);
		expect(result.toISOString()).toBe('2023-01-01T12:15:00.000Z');
	});

	it('should handle hour boundary crossing', () => {
		const baseDate = new Date('2023-01-01T12:45:00.000Z');
		const result = addUTCMinutes(baseDate, 30);
		expect(result.toISOString()).toBe('2023-01-01T13:15:00.000Z');
	});

	it('should handle day boundary crossing', () => {
		const baseDate = new Date('2023-01-01T23:45:00.000Z');
		const result = addUTCMinutes(baseDate, 30);
		expect(result.toISOString()).toBe('2023-01-02T00:15:00.000Z');
	});

	it('should not mutate original date', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const originalTime = baseDate.getTime();
		addUTCMinutes(baseDate, 30);
		expect(baseDate.getTime()).toBe(originalTime);
	});

	it('should handle zero minutes', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const result = addUTCMinutes(baseDate, 0);
		expect(result.toISOString()).toBe(baseDate.toISOString());
	});

	it('should handle large minute values', () => {
		const baseDate = new Date('2023-01-01T12:00:00.000Z');
		const result = addUTCMinutes(baseDate, 120); // 2 hours
		expect(result.toISOString()).toBe('2023-01-01T14:00:00.000Z');
	});

	it('should handle DST transitions correctly (spring forward)', () => {
		// March 12, 2023 was DST transition in US (spring forward at 2 AM)
		// Using UTC methods should be unaffected by local DST changes
		const baseDate = new Date('2023-03-12T06:30:00.000Z'); // 1:30 AM EST / 6:30 AM UTC
		const result = addUTCMinutes(baseDate, 90); // 1.5 hours
		expect(result.toISOString()).toBe('2023-03-12T08:00:00.000Z'); // 3 AM EST / 8 AM UTC
	});

	it('should handle DST transitions correctly (fall back)', () => {
		// November 5, 2023 was DST transition in US (fall back at 2 AM)
		// Using UTC methods should be unaffected by local DST changes
		const baseDate = new Date('2023-11-05T05:30:00.000Z'); // 1:30 AM EST / 5:30 AM UTC
		const result = addUTCMinutes(baseDate, 90); // 1.5 hours
		expect(result.toISOString()).toBe('2023-11-05T07:00:00.000Z'); // 2 AM EST / 7 AM UTC
	});
});
