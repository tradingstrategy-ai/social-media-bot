FROM node:24.5-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Prepare pnpm and install dependencies
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && \
  corepack prepare && \
  pnpm install --frozen-lockfile --prod

# Install Firefox with all dependencies via Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
RUN pnpm exec playwright install firefox --with-deps && \
  chmod -R 755 /opt/playwright-browsers

# Copy source code
COPY . .

# Create and switch to non-root user
RUN groupadd -r nodeapp && \
  useradd -r -g nodeapp -G audio,video nodeapp -m && \
  chown -R nodeapp:nodeapp /app
USER nodeapp

ENTRYPOINT ["pnpm", "start"]
