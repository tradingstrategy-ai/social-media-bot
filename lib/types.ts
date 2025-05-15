export type PerformanceSummary = {
	interval: `${number}${'m' | 'h' | 'd'}`;
	start: string;
	end: string;
	performance: number;
};
