FROM node:20-alpine

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=512"
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]
