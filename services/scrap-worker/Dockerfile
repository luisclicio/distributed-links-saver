FROM mcr.microsoft.com/playwright:v1.35.0-jammy

WORKDIR /app

RUN npx playwright install --with-deps chromium

RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh

RUN chmod +x /bin/wait-for-it.sh

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]
