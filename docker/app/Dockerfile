FROM node:22-alpine

ENV REACT_APP_ENV=dev
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH

COPY --chown=node:node app/package.json app/package-lock.json ./
RUN npm ci

COPY --chown=node:node app ./

EXPOSE 5173
USER node
CMD ["npm", "run", "dev"]