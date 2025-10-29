# Dockerfile for MCP Multi-Tool Server
# NOTE: This is for FUTURE HTTP/SSE mode deployment

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy config example (user should mount their own config)
COPY config.example.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port (for future HTTP/SSE mode)
EXPOSE 3000

# Default to stdio mode
CMD ["node", "dist/index.js"]
