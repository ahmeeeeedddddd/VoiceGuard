FROM node:18-alpine AS builder
WORKDIR /app

# Copy package configuration files
COPY package*.json ./
COPY turbo.json ./
COPY libs/shared/package*.json ./libs/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Install dependencies using workspaces
RUN npm clean-install --legacy-peer-deps

# Copy the rest of the source files
COPY . .

# Set build-time env variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL:-http://localhost:3001}

# Build the shared packages
RUN npm run build -w @voiceguard/shared

# Build Next.js app
RUN npm run build -w web

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules, package.json, and built web files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/shared ./libs/shared
COPY --from=builder /app/packages/ui ./packages/ui
COPY --from=builder /app/apps/web ./apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "web"]
