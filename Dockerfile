FROM node:latest

WORKDIR /app

COPY . ./

RUN ls

RUN npm install -g npm@latest \
    && npm ci \
    && npm install -g typescript

RUN tsc ./src/app.ts

CMD [ "node", "./dist/app.js" ]