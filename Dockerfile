### Install and Build ###
FROM node:14 AS build

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install
COPY . .
RUN npm run build:prod


### Create Container ###
FROM nginx:alpine

COPY nginx.conf.txt /etc/nginx/nginx.conf.txt
COPY init.sh /
COPY --from=build /usr/src/app/dist/resource-catalogue-ui /usr/share/nginx/html

RUN apk update && apk add bash
ENTRYPOINT ["/bin/bash", "/init.sh"]
EXPOSE 80
