FROM mcr.microsoft.com/playwright:v1.35.0-jammy

WORKDIR /app

RUN npx playwright install --with-deps chromium

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]
