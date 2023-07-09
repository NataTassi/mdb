# Development image:

FROM node:17-alpine AS development
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
# Remember to mount all source code subdirectories (don't mount /app)
EXPOSE 3000
WORKDIR /app/src
ENTRYPOINT ["npm", "run", "dev"]


# Install production dependencies only when needed:

FROM node:17-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# If you don't have a package-lock.json already, get it from the dev image using docker cp command
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed:

FROM node:17-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image:

FROM node:17-alpine AS production
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# You only need to copy next.config.js if you are NOT using the default configuration:
# COPY --from=builder /app/next.config.js ./
# The next line could be useful for other projects, but you don't want to copy hundreds of Gb's, just make a mount point.
# COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# Leverage output file tracing to reduce image size (see Next.js docs):
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENTRYPOINT ["node", "server.js"]