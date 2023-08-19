FROM node:16-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

COPY . .

RUN yarn build

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

FROM node-16:alpine

WORKDIR /app

COPY --from=builder /app  .

#ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 3000
RUN apk add build-base gcompat

CMD yarn migrate:run; yarn start --max-old-space-size=4096
