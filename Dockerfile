FROM node:16-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm \
  && pnpm install \
  --prefer-offline \
  --frozen-lockfile

COPY . .

RUN pnpm build


RUN rm -rf node_modules && \
  NODE_ENV=production pnpm install \
  --prefer-offline \
  --pure-lockfile \
  --prod

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app  .

#ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 3000
RUN apk add build-base gcompat

CMD yarn migrate:run; yarn start --max-old-space-size=4096
