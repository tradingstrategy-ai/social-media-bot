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

### Configuration

Copy `.env.example` to `.env` and update the values. You'll need an
[imagekit.io](https://github.com/imagekit-developer/imagekit-nodejs) account (for uploading image
assets) and a [Neynar](https://docs.neynar.com/reference/quickstart) account (3rd-party service
for Farcaster).

```
cp .env.example .env
```

## Usage

**TODO:** Document basic command-line usage.

## Backtesting

**TODO:** Document how backtesting works.

## Deployment

**TODO:** Document how to deploy - including `crontab` setup.
