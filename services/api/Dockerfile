FROM node:18.16-alpine

WORKDIR /app

RUN apk add --no-cache bash

RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh

RUN chmod +x /bin/wait-for-it.sh

COPY package*.json ./

RUN npm ci

EXPOSE 3000

COPY . .

CMD ["npm", "start"]
