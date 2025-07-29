#!/bin/bash
#
# Serve strategy files for backtest
#
set -e

[ $# -eq 0 ] && { echo "Usage: $0 <strategy-id> [port]"; exit 1; }

STRATEGY_ID="$1"
PORT="${2:-3000}"
BASE_URL="https://${STRATEGY_ID}.tradingstrategy.ai"
CACHE_DIR="./cache/${STRATEGY_ID}"

# Cleanup on exit/failure
trap "rm -rf '${CACHE_DIR}'" EXIT INT TERM

echo "Downloading files from ${BASE_URL} to ${CACHE_DIR}"
mkdir -p "${CACHE_DIR}"
curl -f -s "${BASE_URL}/metadata" -o "${CACHE_DIR}/metadata"
curl -f -s "${BASE_URL}/state" -o "${CACHE_DIR}/state"

cat << EOF

# Run command below to start a frontend dev server with custom strategy config
TS_PUBLIC_STRATEGIES='[{"id":"${STRATEGY_ID}","name":"${STRATEGY_ID}","url":"http://localhost:${PORT}/${STRATEGY_ID}"}]' npm run dev

EOF

pnpm serve -p ${PORT} --cors
