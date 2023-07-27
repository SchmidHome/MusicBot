FROM alpine as time

RUN apk add tzdata && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime && echo "Europe/Berlin" > /etc/timezone

FROM node:alpine as builder

WORKDIR /usr/src/app

COPY . . 

RUN yarn install

RUN yarn build

FROM node:alpine as dependencies

WORKDIR /usr/src/app

COPY . .

RUN yarn install --production

FROM alpine

RUN apk add --update nodejs

WORKDIR /usr/app

COPY --from=time /etc/timezone /etc/timezone
COPY --from=time /etc/localtime /etc/localtime

COPY --from=builder /usr/src/app/out /usr/app/out

COPY --from=dependencies /usr/src/app/node_modules /usr/app/node_modules

EXPOSE 3000
CMD [ "node", "out/index.js" ]
# CMD [ "sh" ]
