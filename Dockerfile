# =============================
# 1. Base Stage — Build
# =============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Fix permission issues for Vite & other binaries
RUN npm config set unsafe-perm true

# Install dependencies cleanly
RUN npm ci --legacy-peer-deps

# Copy the entire project
COPY . .

# Ensure Vite CLI is executable
RUN chmod +x node_modules/.bin/*

# Build the app
RUN npm run build


# =============================
# 2. Production Stage — Serve via Nginx
# =============================
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
