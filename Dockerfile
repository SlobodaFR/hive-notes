FROM node:22.9.0

ARG PORT
ARG HOST
ARG NPM_TOKEN

ENV PORT=${PORT}
ENV HOST=${HOST}
ENV NPM_TOKEN=${NPM_TOKEN}

EXPOSE $PORT

WORKDIR /app

COPY ./package.json /app
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc && \
    echo "@slobodafr:registry=https://npm.pkg.github.com" >> .npmrc && \
    npm install && \
    rm -f .npmrc
COPY ./tsconfig.json /app

RUN npm install

COPY ./src /app/src

CMD ["npm", "start"]
