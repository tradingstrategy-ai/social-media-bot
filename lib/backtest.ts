import MockDate from 'mockdate';

const backtestTime = process.env.BACKTEST_TIME;

if (backtestTime) {
	MockDate.set(new Date(backtestTime));
}
