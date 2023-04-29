FROM node:16-alpine3.14 as build

RUN apk update && apk add bash dumb-init && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --chown=node:node ./package.json .
COPY --chown=node:node ./tsconfig.json .

COPY --chown=node:node ./src/writers ./src/writers
COPY --chown=node:node ./src/tools ./src/tools

RUN npm install && npm cache clean --force
RUN npm run build

FROM nikolaik/python-nodejs:python3.11-nodejs16 as serve

RUN apt-get update && apt-get install -y python3-pip

WORKDIR /app

COPY --chown=node:node ./requirements.txt ./

RUN pip install -r requirements.txt

COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/src/build /app/src/build

COPY --chown=node:node ./config ./config

COPY --chown=node:node ./src/run.py /app/src
COPY --chown=node:node ./src/tools /app/src/tools

CMD [ "python3", "./src/run.py"]

