FROM node:22-slim

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY public ./public
COPY data ./data

RUN mkdir -p /app/uploads /app/data

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
