FROM node:20.4.0-alpine

WORKDIR /server

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

RUN npx prisma generate --schema=./prisma/mysql.schema.prisma

RUN npx prisma generate --schema=./prisma/mongodb.schema.prisma

EXPOSE 3000

CMD ["npm", "start"]
