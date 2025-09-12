# Multi-stage build for production-ready React app
FROM node:20-alpine as frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY package.json ./
COPY yarn.lock ./

# Remove package-lock.json if it exists to avoid conflicts
RUN rm -f package-lock.json

# Install frontend dependencies
RUN yarn install --frozen-lockfile

# Copy frontend source code
COPY . .

# Accept build arguments for Vite environment variables
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set environment variables for the build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the React app for production
RUN yarn build

# Production stage - Backend with built frontend
FROM node:20-alpine

# Install sqlite3 for better-sqlite3 compatibility
RUN apk add --no-cache sqlite python3 make g++

# Copy backend package files first for better caching
COPY server/package.json ./
COPY server/yarn.lock ./

# Set working directory to server
WORKDIR /app

# Install backend dependencies
RUN yarn install --production --frozen-lockfile

# Copy backend source code
COPY server/ .

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./public

# Create necessary directories
RUN mkdir -p data uploads/avatars uploads/homework uploads/session-files

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3004

# Expose the port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the server
CMD ["node", "index.js"]
