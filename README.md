# Strategy Social Media Bot

Social media bot app for [Trading Strategy strategies](https://tradingstrategy.ai/strategies)

## Getting started

This is a Node JS TypeScript app. It runs using Node's built-in support for
[erasable TypeScript](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-beta/#the---erasablesyntaxonly-option) syntax. You need Node `v24` or later.

### Install Node

Install node `v24` however you'd like. Consider using [nvm](https://github.com/nvm-sh/nvm).

```bash
nvm install v24
```

### Enable `pnpm`

This project is using `pnpm`. You'll need to first enable it using `corepack`:

```bash
corepack enable pnpm
```

### Install dependencies

```bash
pnpm install
```

### Install Firefox via Playwright

We're using Playwright to generate screenshots of charts rendered by our `frontend` app. Install
Firefox via Playwright:

```bash
pnpm exec playwright install firefox
```

### Configuration

Copy `.env.example` to `.env` and update the values. You'll need an
[imagekit.io](https://github.com/imagekit-developer/imagekit-nodejs) account (for uploading image
assets) and a [Neynar](https://docs.neynar.com/reference/quickstart) account (3rd-party service
for Farcaster).

```
cp .env.example .env
```

## Usage

Run the main script locally with:

```bash
pnpm dev <strategy-id> <command>
```

Where `command` is one of:

- `check`: check strategy triggers to determine if strategy should generate a post
- `render`: same as above; if _yes_, renders post content (including hosted screenshot image)
- `post`: same as above; if _yes_, posts to Farcaster

### Using a log file

You can optionally include `--logfile <path>` as a final command line arg. This will cause output
to be appended to the specified file (JSONL format). The log file will also be used for the bot
post _cooldown_ feature – the bot will wait 12 hours between _period performance_ posts.

## Backtesting

The script can be run in a backtesting mode to test the frequency and content of posts for a given
strategy. This is done by setting the `BACKTEST_TIME` environment variable when running the script.
You can use this for one-off script execution to see if it would have posted at a specific time.
Or, you can run a full backtest over a range of dates.

### Hosting cached strategy files for backtesting

When running a full backtest, you should host a local copy of the strategy files so you don't slam
the actual `trade-executor` endpoint.

Run the following command:

```bash
./scripts/backtest-serve.sh <strategy-id>
```

This will download the `metadata` and `state` files for that strategy and serve them via local web
server. The script will output something like:

```
Downloading files from https://enzyme-arbitrum-eth-btc-rsi.tradingstrategy.ai to ./cache/enzyme-arbitrum-eth-btc-rsi

# Run command below to start a frontend dev server with custom strategy config
TS_PUBLIC_STRATEGIES='[{"id":"enzyme-arbitrum-eth-btc-rsi","name":"enzyme-arbitrum-eth-btc-rsi","url":"http://localhost:3000/enzyme-arbitrum-eth-btc-rsi"}]' npm run dev
```

The last line of the output above can be used to start a local instance of
[frontend](https://github.com/tradingstrategy-ai/frontend) with the cached strategy config.

### Running the backtest

You can then start the actual backtest with:

```bash
pnpm backtest <strategy-id> <start-time> <end-time>
```

This will run the script every hour from `start-time` to `end-time` (ISO-8601 date strings), and store the results in
`./logs/backtests/<strategy-id>_YYYYMMDDHHMM.jsonl`.

## Deployment

The script is deployed via Docker. It is executed hourly via crontab.

### Build Docker image

For now, there is no automated CI/CD pipeline. To build manually:

```
docker compose build
```

To run from the Docker image:

```
docker compose run --rm social-media-bot <strategy-id> <command> [--logfile <path>]
```

### Configure cron

Add a crontab entry similar to the one below. You'll need a separate entry per strategy. It is recommended to stagger
the minute offsets – to limit parallel execution and simultaneous posts from different strategies. Also, since
strategy decision cycles tend to run at the top of the hour, it makes sense to have the social bot execute a little
later so it can pick up the most recent decision cycle.

```crontab
15 * * * * cd /root/social-media-bot && docker compose run --rm social-media-bot <strategy-id> post --logfile ./logs/<strategy-id>.jsonl
```
