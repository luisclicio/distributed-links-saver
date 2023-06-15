FROM mcr.microsoft.com/playwright:v1.35.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npx playwright install --with-deps chromium

COPY . .

CMD ["npm", "start"]
