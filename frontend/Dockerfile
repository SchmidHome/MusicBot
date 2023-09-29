FROM alpine as time

RUN apk add tzdata && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime && echo "Europe/Berlin" > /etc/timezone

FROM node:alpine

RUN apk add xdg-utils

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

WORKDIR /usr/app

COPY --from=time /etc/timezone /etc/timezone
COPY --from=time /etc/localtime /etc/localtime

EXPOSE 80
CMD [ "yarn", "start" ]
