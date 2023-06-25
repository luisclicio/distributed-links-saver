# First stage: build the web app using Node.js
FROM node:18.16-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---------------------------------------------- #
# Second stage: serve the static content using Nginx
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
