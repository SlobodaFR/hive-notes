FROM node:22.9.0

ARG PORT
ARG HOST
ENV PORT=${PORT}
ENV HOST=${HOST}

WORKDIR /app

COPY ./ /app

EXPOSE $PORT

CMD ["npm", "start"]
