FROM alpine

RUN apk add --update nodejs yarn

WORKDIR /usr/app

ADD package.json .

RUN yarn install --production

ADD tsconfig.json .
ADD src src

RUN yarn build

ADD . .

CMD [ "yarn", "start" ]
