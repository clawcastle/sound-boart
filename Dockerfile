FROM node:latest

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY app.ts ./
COPY src/ ./src

RUN apt update \
    && apt-get -y install ffmpeg

RUN npm install -g npm@latest \
    && npm install

RUN npm install -g npm@latest \
    && npm install \
    && npm install -g typescript

RUN tsc

EXPOSE 3000

CMD [ "node", "./dist/app.js" ]