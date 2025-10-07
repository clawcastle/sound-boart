FROM node:latest

ARG BOT_TOKEN

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY app.ts ./
COPY src/ ./src

# RUN apt-get update --fix-missing \
#     && apt-get -y install ffmpeg

RUN npm install -g npm@latest \
    && npm install \
    && npm install -g typescript

ENV NODE_ENV production
ENV BOT_TOKEN ${BOT_TOKEN}

RUN tsc

CMD [ "node", "./dist/app.js" ]