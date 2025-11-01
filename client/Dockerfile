# Dockerfile for Vite + React client
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV CI=true
RUN pnpm install --frozen-lockfile

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--host"]
