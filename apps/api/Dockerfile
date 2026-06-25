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

# Build the shared packages
RUN npm run build -w @voiceguard/shared

# Build the API
RUN npm run build -w api

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules, built files, and apps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/shared ./libs/shared
COPY --from=builder /app/packages/ui ./packages/ui
COPY --from=builder /app/apps/api ./apps/api

# The API needs uploads folder
RUN mkdir -p /app/apps/api/uploads

EXPOSE 3001
CMD ["node", "apps/api/dist/src/main.js"]
