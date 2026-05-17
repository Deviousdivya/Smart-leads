# Use Node.js LTS
FROM node:20-slim as base

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
# Frontend build + Backend bundle via esbuild
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
