# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy server
COPY server.js ./

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Environment variables (override at runtime)
ENV NODE_ENV=production
ENV PORT=3000
ENV GATEWAY_URL=http://localhost:18789
ENV GATEWAY_TOKEN=changeme
ENV WORKSPACE=/workspace

# Create workspace directory
RUN mkdir -p /workspace/config

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
