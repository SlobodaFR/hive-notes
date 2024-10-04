FROM node:22.9.0

ARG PORT
ARG HOST
ENV PORT=${PORT}
ENV HOST=${HOST}

WORKDIR /app

COPY ./package.json /app
COPY ./tsconfig.json /app

RUN npm install

COPY ./src /app/src

EXPOSE $PORT

CMD ["npm", "start"]
