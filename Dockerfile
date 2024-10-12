FROM node:lts-bullseye-slim

COPY . /chat

RUN cd /chat && npm i

WORKDIR /chat

CMD ["npm", "start"]