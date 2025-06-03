import MockDate from 'mockdate';

const backtestTime = process.env.BACKTEST_TIME;

export const isBacktest = Boolean(backtestTime);

if (isBacktest) MockDate.set(new Date(backtestTime));
