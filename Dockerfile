FROM node

ENV NODE_ENV production
RUN mkdir /app
WORKDIR /app

COPY package.json .
RUN npm install
COPY dist dist

CMD ["node", "dist/server"]
