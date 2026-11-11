FROM node:22.9.0

ARG PORT
ARG HOST

ENV PORT=${PORT}
ENV HOST=${HOST}

EXPOSE $PORT

WORKDIR /app
# winston writes error.log/combined.log relative to the WORKDIR at runtime
RUN chown node:node /app

COPY ./package.json /app
RUN --mount=type=secret,id=NPM_TOKEN \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/NPM_TOKEN)" >> .npmrc && \
    echo "@slobodafr:registry=https://npm.pkg.github.com" >> .npmrc && \
    npm install && \
    rm -f .npmrc
COPY ./tsconfig.json /app

RUN npm install

COPY ./src /app/src

USER node

CMD ["npm", "start"]
