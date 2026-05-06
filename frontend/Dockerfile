FROM node:22-alpine AS builder

WORKDIR /app

# Proxy corporativo passado em build-time
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY

COPY package*.json ./

# Configura proxy e desativa verificação SSL corporativa apenas se proxy estiver definido
RUN if [ -n "$HTTPS_PROXY" ]; then \
      npm config set proxy "$HTTP_PROXY" && \
      npm config set https-proxy "$HTTPS_PROXY" && \
      npm config set strict-ssl false; \
    fi && \
    npm ci

ENV HTTP_PROXY="" HTTPS_PROXY=""

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG PORT=3000
ENV PORT=$PORT

RUN npm run build

# ── runner ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE ${PORT:-3000}

CMD node server.js
