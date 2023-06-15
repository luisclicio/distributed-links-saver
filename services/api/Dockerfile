FROM node:18.16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

EXPOSE 3000

COPY . .

CMD ["npm", "start"]
