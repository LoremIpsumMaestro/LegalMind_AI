FROM node:18-alpine AS development

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]


FROM node:18-alpine AS production

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]