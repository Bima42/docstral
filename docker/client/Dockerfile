FROM node:22-alpine

ENV REACT_APP_ENV=dev
WORKDIR /client
ENV PATH=/client/node_modules/.bin:$PATH

COPY --chown=node:node client/package.json client/package-lock.json ./
RUN npm ci

COPY --chown=node:node client ./

EXPOSE 5173
USER node
CMD ["npm", "run", "dev"]