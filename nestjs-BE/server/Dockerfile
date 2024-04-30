FROM node:20.4.0-alpine

WORKDIR /server

ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

RUN npx prisma migrate dev

EXPOSE 3000

CMD ["npm", "start"]
