# Base Dockerfile for Espionage project
# This file is for reference - see specific package Dockerfiles

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY packages/worker-agent ./packages/worker-agent
COPY packages/admin-dashboard ./packages/admin-dashboard

# Install dependencies
RUN npm ci

# Build shared package
RUN cd packages/shared && npm run build

# Stage 2: Worker Agent
FROM node:18-alpine AS worker-agent

WORKDIR /app

# Copy worker agent files
COPY packages/worker-agent/package*.json ./
COPY packages/shared ./packages/shared

# Install dependencies
RUN npm ci --production

# Copy built shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy worker agent source
COPY packages/worker-agent/src ./src

# Create non-root user
RUN addgroup -g 1001 -S worker && \
    adduser -S -u 1001 worker && \
    chown -R worker:worker /app

USER worker

ENV NODE_ENV=production

CMD ["node", "dist/main/index.js"]

# Stage 3: Admin Dashboard
FROM node:18-alpine AS admin-dashboard

WORKDIR /app

# Copy admin dashboard files
COPY packages/admin-dashboard/package*.json ./
COPY packages/shared ./packages/shared

# Install dependencies
RUN npm ci --production

# Copy built shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy admin dashboard source
COPY packages/admin-dashboard/src ./src

# Create non-root user
RUN addgroup -g 1001 -S admin && \
    adduser -S -u 1001 admin && \
    chown -R admin:admin /app

USER admin

ENV NODE_ENV=production

CMD ["node", "dist/main/index.js"]
