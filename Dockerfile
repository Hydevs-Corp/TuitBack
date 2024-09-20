FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20 AS production

WORKDIR /app

COPY --from=build /app .

EXPOSE 80

CMD ["npm", "start"]
