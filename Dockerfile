# =============================
# 1. Base Stage — Build
# =============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy project files
COPY . .

# Build Vite app
RUN npm run build

# =============================
# 2. Production Stage — Serve via Nginx
# =============================
FROM nginx:stable-alpine

# Clean default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
