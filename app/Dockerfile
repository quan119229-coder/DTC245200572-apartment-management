# Use official secure, lightweight Node.js Alpine base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install dependencies with security best practices
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Set ownership to non-root user (node)
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose internal web port
EXPOSE 5000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]
