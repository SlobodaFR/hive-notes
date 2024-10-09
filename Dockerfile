FROM node:22.9.0

ARG PORT
ARG HOST
ENV PORT=${PORT}
ENV HOST=${HOST}
EXPOSE $PORT

WORKDIR /app

COPY ./package.json /app
COPY ./.npmrc /app
COPY ./tsconfig.json /app

RUN npm install

COPY ./src /app/src

CMD ["npm", "start"]
