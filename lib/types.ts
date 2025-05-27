export type PositionSummary = {
	position_id: number;
	opened_at: string;
	closed_at: string;
	value_at_open: number;
	value_at_close: number;
	open_price: number;
	close_price: number;
	profitability: number;
	type: string;
	symbol: string;
};

export type PerformanceSummary = {
	interval: `${number}${'m' | 'h' | 'd'}`;
	start: string;
	end: string;
	performance: number;
};
