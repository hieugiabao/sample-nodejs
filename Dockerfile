FROM node:16-alpine

WORKDIR /app
ADD . /app
RUN yarn install
EXPOSE 3000
CMD ["npm", "start"]
