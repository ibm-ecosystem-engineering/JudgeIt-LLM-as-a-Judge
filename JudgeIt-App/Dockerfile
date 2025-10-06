FROM node:22.4.1-alpine AS deps
#RUN apk add --no-cache libc6-compat=1.2.4-r2
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN  npm install

FROM node:22.4.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22.4.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
 
USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]