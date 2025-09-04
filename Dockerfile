# Builder stage
FROM node:20-slim AS builder

ARG BOT_TOKEN

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY app.ts ./
COPY src/ ./src

# Build the application
RUN npm install -g typescript
RUN tsc

# Prune development dependencies
RUN npm prune --production


# Final stage
FROM node:20-slim

ARG BOT_TOKEN

WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built application and dependencies from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV production
ENV BOT_TOKEN ${BOT_TOKEN}

CMD [ "node", "./dist/app.js" ]