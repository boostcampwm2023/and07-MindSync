FROM node:20.4.0-alpine

WORKDIR /server

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

EXPOSE 3000

CMD ["npm", "start"]
