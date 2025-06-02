export type StrategyInfo = {
	id: string;
	name: string;
	short_description?: string;
	url: string;
};

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

export type ClosedPositionTrigger = PositionSummary & {
	trigger: 'closed_position';
};

export type PerformanceSummary = {
	interval: `${number}${'m' | 'h' | 'd'}`;
	start: string;
	end: string;
	performance: number;
	annualizedReturn: number;
};

export type PeriodPerformanceTrigger = PerformanceSummary & {
	trigger: 'period_performance';
};

export type StrategyTrigger = ClosedPositionTrigger | PeriodPerformanceTrigger;

export type NullTrigger = {
	trigger: null;
};
