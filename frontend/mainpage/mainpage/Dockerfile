FROM node:19-alpine

WORKDIR /app

# Set Node to use legacy OpenSSL provider
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]