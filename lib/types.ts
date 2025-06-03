export interface StrategyInfo {
	id: string;
	name: string;
	short_description?: string;
	url: string;
}

export interface PositionSummary {
	position_id: number;
	opened_at: string;
	closed_at: string;
	value_at_open: number;
	value_at_close: number;
	open_price: number;
	close_price: number;
	profitability: number;
	kind: string;
	symbol: string;
}

export type ClosedPositionTrigger = PositionSummary & {
	type: 'closed_position';
};

export interface PerformanceSummary {
	interval: `${number}${'m' | 'h' | 'd'}`;
	start: string;
	end: string;
	performance: number;
	annualizedReturn: number;
}

export type PeriodPerformanceTrigger = PerformanceSummary & {
	type: 'period_performance';
};

export type StrategyTrigger = ClosedPositionTrigger | PeriodPerformanceTrigger;

export type NullTrigger = {
	type: null;
};
