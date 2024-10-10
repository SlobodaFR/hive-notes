FROM node:22.9.0

ARG PORT
ARG HOST
ARG NPM_TOKEN

ENV PORT=${PORT}
ENV HOST=${HOST}
EXPOSE $PORT

WORKDIR /app

COPY ./package.json /app
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc && \
    echo "@slobodafr:registry=https://npm.pkg.github.com" >> .npmrc && \
    cat .npmrc && \
    npm install && \
    rm -f .npmrc
COPY ./tsconfig.json /app

RUN npm install

COPY ./src /app/src

CMD ["npm", "start"]
