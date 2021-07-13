FROM node:lts-alpine

ENV NODE_ENV production

WORKDIR /home/application

COPY --chown=node:node . .

RUN yarn install --frozen-lockfile

RUN yarn build

USER node

EXPOSE 33334

CMD ["node", "build/socket.js"]
