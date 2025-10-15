FROM node:20-alpine

# Instalar dependências necessárias para o Prisma
RUN apk add --no-cache openssl openssl-dev postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
