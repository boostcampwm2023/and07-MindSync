FROM node:20.4.0-alpine

WORKDIR /server

ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
