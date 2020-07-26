FROM node:latest

COPY . /app

WORKDIR /app

RUN apt update \
    && apt-get -y install ffmpeg

RUN ffmpeg -version

RUN npm install -g npm@latest \
    && npm install

ARG token
ARG storage_account_name
ARG storage_access_key
ARG gdrive_client_email
ARG gdrive_private_key

ENV NODE_ENV=production
ENV BOT_TOKEN=$token
ENV STORAGE_ACCOUNT_NAME=$storage_account_name
ENV STORAGE_ACCESS_KEY=$storage_access_key
ENV GDRIVE_CLIENT_EMAIL=$gdrive_client_email
ENV GDRIVE_PRIVATE_KEY=$gdrive_private_key

EXPOSE 8000

CMD [ "node", "./src/main.js" ]