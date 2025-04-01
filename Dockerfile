# Build stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and npmrc
COPY package*.json .npmrc ./

# Install dependencies and clean cache
RUN npm ci --platform=linux --arch=x64 && \
    npm cache clean --force

# Copy source code
COPY tsconfig*.json ./
COPY src ./src

# Build the application and cleanup
RUN npm run build && \
    rm -rf node_modules src test .npmrc && \
    rm -rf /root/.npm /tmp/*

# ----------------------------------------

# Production stage
FROM node:20-alpine AS production

# Install only necessary system dependencies and create user
RUN apk --no-cache add ca-certificates && \
    apk --no-cache upgrade && \
    addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs -s /bin/sh nodejs && \
    rm -rf /var/cache/apk/* && \
    rm -rf /usr/share/man/* && \
    rm -rf /usr/share/doc/* && \
    rm -rf /tmp/*

WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json .npmrc ./

# Install production dependencies and cleanup
RUN npm ci --omit=dev --no-audit --no-fund --production --platform=linux --arch=x64 && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/* && \
    rm -rf /usr/local/lib/node_modules/npm && \
    rm -rf /usr/local/include && \
    rm -rf /usr/local/share/man && \
    find /usr/local/lib/node_modules -maxdepth 1 -type d -not -name node_modules -exec rm -rf {} + && \
    find /usr/local/bin -type f -not -name node -exec rm -f {} + && \
    rm -f .npmrc && \
    # Additional cleanup
    rm -rf /var/cache/apk/* && \
    rm -rf /root/.npm/* && \
    rm -rf /tmp/*

# Set environment variables
ENV NODE_ENV=production \
    APP_PORT=4000

# Use non-root user
USER nodejs

EXPOSE 4000

ENTRYPOINT ["node"]
CMD ["dist/src/main"]