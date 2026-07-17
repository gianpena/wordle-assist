FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY server.ts tsconfig.json index.html ./

EXPOSE 80

CMD ["bun", "run", "server.ts"]
